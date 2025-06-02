import { FactoryProvider } from '@nestjs/common';
import { JWK } from 'node-jose';

export const KEY_STORE = 'KEY_STORE';

export const keyStoreProvider: FactoryProvider<JWK.KeyStore> = {
    provide: KEY_STORE,
    useFactory: () => JWK.createKeyStore(),
};
