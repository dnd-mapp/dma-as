import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { plainToInstance } from 'class-transformer';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { JWK } from 'node-jose';
import { KeysRepository } from './keys.repository';
import { KeyData, TIME_30_DAYS } from './models';
import { KEY_STORE } from './providers';

@Injectable()
export class KeysService implements OnModuleInit {
    private readonly encryptionKey: string;

    constructor(
        @Inject(KEY_STORE) private readonly keystore: JWK.KeyStore,
        private readonly keysRepository: KeysRepository,
        private readonly configService: ConfigService
    ) {
        this.keystore = keystore;
        this.encryptionKey = this.configService.get<string>('encryptionKey');
    }

    public async onModuleInit() {
        await this.importStoredKeys();
        await this.removePublicKeys();
    }

    public getKeys() {
        return this.keystore.toJSON();
    }

    public async getKeysByClientId(clientId: string) {
        const storedKeys = await this.keysRepository.findAllByClientId(clientId);

        const kid = storedKeys.filter(({ privateKey }) => privateKey).map(({ kid }) => kid)[0];
        return this.getKeysByKid(kid);
    }

    public getKeysByKid(kid: string) {
        return this.keystore.get({ kid: kid });
    }

    public async generateKeyPair(clientId: string) {
        const keyPair = await this.keystore.generate('RSA', 4096, { alg: 'RS256', use: 'sig' });

        const publicKey = keyPair.toPEM();
        const privateKey = this.encryptPrivateKey(keyPair.toPEM(true));

        await this.keysRepository.store(
            plainToInstance(KeyData, {
                kid: keyPair.kid,
                publicKey: publicKey,
                privateKey: privateKey,
                clientId: clientId,
            })
        );

        return keyPair.kid;
    }

    public async rotateKeysForClient(clientId: string) {
        const { kid } = await this.getKeysByClientId(clientId);

        const key = this.keystore.get({ kid: kid });
        this.keystore.remove(key);

        await this.keystore.add(key.toPEM(), 'pem');
        await this.keysRepository.removePrivateKeyByKid(kid);

        return await this.generateKeyPair(clientId);
    }

    // Runs every day at 03:00.
    @Cron('0 0 03 * * *')
    protected async removePublicKeys() {
        const keys = await this.keysRepository.findAllKeys();

        await Promise.all(
            keys.map((key) => {
                if (key.lastUsed.getTime() + TIME_30_DAYS > Date.now()) return;
                const storedKey = this.getKeysByKid(key.kid);

                this.keystore.remove(storedKey);
                this.keysRepository.removeByKid(key.kid);
            })
        );
    }

    private async importStoredKeys() {
        const keys = await this.keysRepository.findAllKeys();

        keys.forEach((key) => {
            if (key.privateKey) this.keystore.add(this.decryptPrivateKey(key.privateKey), 'pem');
            else this.keystore.add(key.publicKey, 'pem');
        });
    }

    private decryptPrivateKey(encryptedPrivateKey: string) {
        const [initializationVector, encryptedData] = encryptedPrivateKey.split(':');
        const iv = Buffer.from(initializationVector, 'hex');

        const cipher = createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), iv);
        let decryptedPrivateKey = cipher.update(encryptedData, 'hex', 'utf8');
        decryptedPrivateKey += cipher.final('utf8');
        return decryptedPrivateKey;
    }

    private encryptPrivateKey(privateKey: string) {
        const initializationVector = randomBytes(16);
        const cipher = createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), initializationVector);

        let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
        encryptedPrivateKey += cipher.final('hex');

        return `${initializationVector.toString('hex')}:${encryptedPrivateKey}`;
    }
}
