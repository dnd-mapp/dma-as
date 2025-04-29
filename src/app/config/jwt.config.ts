import { JwtModuleAsyncOptions, JwtSecretRequestType } from '@nestjs/jwt';
import { readFile } from 'fs/promises';

export const JWT_ISSUER = 'DnD-Mapp Authentication Server';

export const jwtOptions: JwtModuleAsyncOptions = {
    global: true,
    useFactory: async () => ({
        global: true,
        verifyOptions: {
            algorithms: ['RS256'],
            complete: true,
            allowInvalidAsymmetricKeyTypes: false,
        },
        signOptions: {
            algorithm: 'RS256',
            allowInsecureKeySizes: false,
            allowInvalidAsymmetricKeyTypes: false,
        },
        secretOrKeyProvider: async (requestType) => {
            if (requestType === JwtSecretRequestType.SIGN)
                return await readFile('private-jwt.key', { encoding: 'utf8' });
            else if (requestType === JwtSecretRequestType.VERIFY)
                return await readFile('public-jwt.key', { encoding: 'utf8' });
            return null;
        },
    }),
};
