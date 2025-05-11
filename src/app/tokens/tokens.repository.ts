import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database';
import { TokenMetadata } from '../shared';

@Injectable()
export class TokensRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public findByJti = async (jti: string) =>
        plainToInstance(
            TokenMetadata,
            await this.databaseService.token.findFirst({ where: { jti: jti }, include: { user: true } })
        );

    public findAllByPti = async (pti: string) =>
        plainToInstance(TokenMetadata, await this.databaseService.token.findMany({ where: { pti: pti } }));

    public findAllByUserIdAndNotRevoked = async (userId: string) =>
        plainToInstance(
            TokenMetadata,
            await this.databaseService.token.findMany({ where: { AND: [{ sub: userId }, { rvk: false }] } })
        );

    public create = async (metadata: TokenMetadata) =>
        plainToInstance(
            TokenMetadata,
            await this.databaseService.token.create({
                data: {
                    tpe: metadata.tpe,
                    rvk: metadata.rvk,
                    sub: metadata.sub,
                    iss: metadata.iss,
                    aud: metadata.aud,
                    iat: metadata.iat,
                    exp: metadata.exp,
                    nbf: metadata.nbf,
                    pti: metadata.pti ?? null,
                },
            })
        );

    public update = async (token: TokenMetadata) =>
        plainToInstance(
            TokenMetadata,
            await this.databaseService.token.update({
                where: { jti: token.jti },
                data: {
                    tpe: token.tpe,
                    rvk: token.rvk,
                    sub: token.sub,
                    iss: token.iss,
                    aud: token.aud,
                    iat: token.iat,
                    exp: token.exp,
                    nbf: token.nbf,
                },
            })
        );

    public async removeByJti(jti: string) {
        await this.databaseService.token.delete({ where: { jti: jti } });
    }

    public async revokeAllBySub(userId: string) {
        await this.databaseService.token.updateMany({ where: { sub: userId }, data: { rvk: true } });
    }

    public async revokeByJti(jti: string) {
        await this.databaseService.token.update({ where: { jti: jti }, data: { rvk: true } });
    }

    public async removeAllByAud(aud: string) {
        await this.databaseService.token.deleteMany({ where: { aud: aud } });
    }
}
