import { JwtModuleAsyncOptions } from '@nestjs/jwt';

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
    }),
};
