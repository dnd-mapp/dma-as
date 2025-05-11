import { Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cron } from '@nestjs/schedule';
import { plainToInstance } from 'class-transformer';
import { KeysService } from '../keys';
import { DmaLogger } from '../logging';
import {
    ACCESS_TOKEN_EXPIRATION_TIME,
    Client,
    GenerateTokenParams,
    REFRESH_TOKEN_EXPIRATION_TIME,
    REFRESH_TOKEN_NBF,
    TokenMetadata,
    TokenType,
    TokenTypes,
} from '../shared';
import { TokensRepository } from './tokens.repository';

@Injectable()
export class TokensService implements OnModuleInit {
    constructor(
        private readonly jwtService: JwtService,
        private readonly logger: DmaLogger,
        private readonly keysService: KeysService,
        private readonly tokensRepository: TokensRepository
    ) {
        this.logger.setContext('TokensRepository');
    }

    public async onModuleInit() {
        await this.removeExpired();
    }

    public async getById(tokenId: string) {
        return await this.tokensRepository.findByJti(tokenId);
    }

    public async getCurrentActiveTokenFromUser(userId: string) {
        return await this.tokensRepository.findAllByUserIdAndNotRevoked(userId);
    }

    public async generateTokens(client: Client, userId: string, pti?: string) {
        const key = await this.keysService.getKeysByClientId(client.id);

        const params = {
            userId: userId,
            pti: pti,
            key: key,
        };
        const accessToken = await this.generateToken({
            ...params,
            audience: client.audience,
            tokenType: TokenTypes.ACCESS,
        });
        const refreshToken = await this.generateToken({
            ...params,
            audience: 'dnd-mapp/authorization-server',
            tokenType: TokenTypes.REFRESH,
        });

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }

    public async update(token: TokenMetadata) {
        return await this.tokensRepository.update(token);
    }

    public async removeByJti(jti: string) {
        await this.tokensRepository.removeByJti(jti);
    }

    public async revokeTokenLinage(jti: string) {
        const tokens = await this.getChildByPti(jti);

        await Promise.all(
            tokens.map((token) => {
                if (!token.rvk) this.revokeByJti(token.jti);
                this.revokeTokenLinage(token.jti);
            })
        );
    }

    public async revokeAllFromUser(userId: string) {
        await this.tokensRepository.revokeAllBySub(userId);
    }

    public async removeAllByAudience(audience: string) {
        await this.tokensRepository.removeAllByAud(audience);
    }

    // Runs every whole hour
    @Cron('0 0 * * * *')
    protected async removeExpired() {
        this.logger.log('Removing expired tokens.');
        await this.tokensRepository.removeAllExpired();
    }

    private async generateToken(params: GenerateTokenParams) {
        const { audience, userId, tokenType, pti, key } = params;
        const metadata = this.constructTokenMetadata(audience, userId, tokenType, pti);

        const tokenMetadata = await this.tokensRepository.create(metadata);

        return {
            token: await this.jwtService.signAsync(
                {
                    jti: tokenMetadata.jti,
                    sub: tokenMetadata.sub,
                    iss: tokenMetadata.iss,
                    iat: Number.parseInt(`${tokenMetadata.iat.getTime() / 1000}`),
                    exp: Number.parseInt(`${tokenMetadata.exp.getTime() / 1000}`),
                    aud: tokenMetadata.aud,
                    ...(tokenMetadata.nbf ? { nbf: Number.parseInt(`${tokenMetadata.nbf.getTime() / 1000}`) } : {}),
                },
                {
                    header: {
                        alg: 'RS256',
                        kid: key.kid,
                    },
                    privateKey: key.toPEM(true),
                }
            ),
            expirationTime: tokenMetadata.exp,
        };
    }

    private constructTokenMetadata(audience: string, userId: string, tokenType: TokenType, pti?: string) {
        const now = new Date();

        return plainToInstance(TokenMetadata, {
            sub: userId,
            tpe: tokenType,
            iss: 'dnd-mapp/authentication-server',
            aud: audience,
            rvk: false,
            iat: now,
            exp: new Date(
                now.getTime() +
                    (tokenType === TokenTypes.ACCESS ? ACCESS_TOKEN_EXPIRATION_TIME : REFRESH_TOKEN_EXPIRATION_TIME)
            ),
            ...(tokenType === TokenTypes.REFRESH ? { nbf: new Date(now.getTime() + REFRESH_TOKEN_NBF) } : {}),
            ...(pti ? { pti: pti } : {}),
        });
    }

    private async revokeByJti(jti: string) {
        await this.tokensRepository.revokeByJti(jti);
    }

    private async getChildByPti(pti: string) {
        return await this.tokensRepository.findAllByPti(pti);
    }
}
