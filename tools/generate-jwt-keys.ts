import { rm, writeFile } from 'fs/promises';
import { JWK } from 'node-jose';

const privateKeyPath = 'private-jwt.key';
const publicKeyPath = 'public-jwt.key';

async function generateJwtKeys() {
    console.log('Generating public and private keys to sign JWT tokens...');

    await rm(privateKeyPath, { force: true });
    await rm(publicKeyPath, { force: true });

    const keystore = JWK.createKeyStore();

    const key = await keystore.generate('RSA', 4096, { alg: 'RS256', use: 'sig' });

    await writeFile(privateKeyPath, key.toPEM(true), { encoding: 'utf8' });
    await writeFile(publicKeyPath, key.toPEM(), { encoding: 'utf8' });

    console.log('Public and private keys have been generated successfully.');
}

(async () => {
    try {
        await generateJwtKeys();
    } catch (error) {
        console.error(error);
    }
})();
