import { createHash, randomBytes } from 'crypto';
import { nanoid } from 'nanoid';

function generateCodeVerifierAndChallenge() {
    const codeVerifier = Buffer.from(nanoid(43)).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
    const encryptionKey = randomBytes(32).toString('hex');

    const state = nanoid();

    console.log({ codeVerifier, codeChallenge, state, encryptionKey });
}

generateCodeVerifierAndChallenge();
