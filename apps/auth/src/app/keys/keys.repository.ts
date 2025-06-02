import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database';
import { KeyData } from './models';

@Injectable()
export class KeysRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    public findAllKeys = async () => plainToInstance(KeyData, await this.databaseService.key.findMany());

    public findAllByClientId = async (clientId: string) =>
        plainToInstance(KeyData, await this.databaseService.key.findMany({ where: { clientId: clientId } }));

    public store = async (data: KeyData) =>
        plainToInstance(
            KeyData,
            await this.databaseService.key.create({
                data: data,
            })
        );

    public async removeByKid(kid: string) {
        await this.databaseService.key.delete({ where: { kid: kid } });
    }

    public async removePrivateKeyByKid(kid: string) {
        await this.databaseService.key.update({
            where: { kid: kid },
            data: { privateKey: null },
        });
    }
}
