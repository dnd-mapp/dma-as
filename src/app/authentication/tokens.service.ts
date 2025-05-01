import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import {
    ACCESS_TOKEN_EXPIRATION_TIME,
    REFRESH_TOKEN_EXPIRATION_TIME,
    REFRESH_TOKEN_NBF,
    TokenMetadata,
    TokenType,
    TokenTypes,
} from '../shared';
import { TokensRepository } from './tokens.repository';

@Injectable()
export class TokensService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly tokensRepository: TokensRepository
    ) {
        // TODO: setup cron job to periodically remove expired or revoked tokens from the database
        // TODO: Remove cron job before application is shut down
    }

    public async getById(tokenId: string) {
        return await this.tokensRepository.findByJti(tokenId);
    }

    public async getCurrentActiveTokenFromUser(userId: string) {
        return await this.tokensRepository.findAllByUserIdAndNotRevoked(userId);
    }

    public async generateTokens(audience: string, userId: string, pti?: string) {
        const accessToken = await this.generateToken(audience, userId, TokenTypes.ACCESS, pti);
        const refreshToken = await this.generateToken(audience, userId, TokenTypes.REFRESH, pti);

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

    public async removeRevokedToken(jti: string, pti?: string) {
        let tokens: TokenMetadata[] = [];

        if (pti) {
            tokens = await this.tokensRepository.findAllByPti(pti);
        }
        if (tokens.length > 0) {
            await Promise.all(
                tokens.map((token) => {
                    this.removeRevokedToken(token.jti, token.pti);
                    this.removeByJti(token.jti);
                })
            );
        }
        await this.removeByJti(jti);
    }

    public async removeAllFromUser(userId: string) {
        await this.tokensRepository.removeAllBySub(userId);
    }

    private async generateToken(audience: string, userId: string, tokenType: TokenType, pti?: string) {
        const metadata = this.constructTokenMetadata(audience, userId, tokenType, pti);

        const tokenMetadata = await this.tokensRepository.create(metadata);

        return {
            token: await this.jwtService.signAsync({
                jti: tokenMetadata.jti,
                sub: tokenMetadata.sub,
                iss: tokenMetadata.iss,
                iat: Number.parseInt(`${tokenMetadata.iat.getTime() / 1000}`),
                exp: Number.parseInt(`${tokenMetadata.exp.getTime() / 1000}`),
                aud: tokenMetadata.aud,
                ...(tokenMetadata.nbf ? { nbf: Number.parseInt(`${tokenMetadata.nbf.getTime() / 1000}`) } : {}),
            }),
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
}
