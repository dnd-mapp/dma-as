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
                },
            })
        );
}
