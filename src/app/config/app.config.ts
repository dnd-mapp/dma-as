import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';
import { parseNumber } from '../utils';

const ENV_NAME_HOST = 'HOST' as const;
const ENV_NAME_PORT = 'PORT' as const;
const ENV_NAME_SSL_CERT_PATH = 'SSL_CERT_PATH' as const;
const ENV_NAME_SSL_KEY_PATH = 'SSL_KEY_PATH' as const;
const ENV_NAME_COOKIE_SIGNING_SECRET = 'COOKIE_SIGNING_SECRET' as const;

export class SSLConfig {
    cert: string;
    key: string;
}

export class AppConfig {
    host: string;
    port: number;
    ssl: SSLConfig | null;
    cookieSigningSecret: string;
}

function hasSSLCertificateAndKey() {
    return process.env[ENV_NAME_SSL_CERT_PATH] && process.env[ENV_NAME_SSL_KEY_PATH];
}

export const appConfig = () =>
    ({
        host: process.env[ENV_NAME_HOST],
        port: parseNumber(process.env[ENV_NAME_PORT]),
        ssl: !hasSSLCertificateAndKey()
            ? null
            : {
                  cert: process.env[ENV_NAME_SSL_CERT_PATH],
                  key: process.env[ENV_NAME_SSL_KEY_PATH],
              },
        cookieSigningSecret: process.env[ENV_NAME_COOKIE_SIGNING_SECRET],
    }) satisfies AppConfig;

const appConfigSchema = Joi.object({
    [ENV_NAME_HOST]: Joi.string().hostname().default('0.0.0.0'),
    [ENV_NAME_PORT]: Joi.number().port().default(3000),
    [ENV_NAME_SSL_CERT_PATH]: Joi.string(),
    [ENV_NAME_SSL_KEY_PATH]: Joi.string(),
    [ENV_NAME_COOKIE_SIGNING_SECRET]: Joi.string().length(64),
});

export const configOptions: ConfigModuleOptions = {
    cache: true,
    envFilePath: ['.env'],
    expandVariables: true,
    isGlobal: true,
    load: [appConfig],
    validationSchema: appConfigSchema,
    validationOptions: {
        abortEarly: true,
        allowUnknowns: false,
    },
};
