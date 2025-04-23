import { ClassProvider } from '@nestjs/common';
import { ConfigModuleOptions } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { minutes, seconds, ThrottlerGuard, ThrottlerModuleOptions } from '@nestjs/throttler';
import * as Joi from 'joi';
import { parseNumber } from '../utils';

export class SSLConfig {
    cert: string;
    key: string;
}

export class AppConfig {
    host: string;
    port: number;
    ssl: SSLConfig | null;
}

function hasSSLCertificateAndKey() {
    return process.env['SSL_CERT_PATH'] && process.env['SSL_KEY_PATH'];
}

export const appConfig = () =>
    ({
        host: process.env['HOST'],
        port: parseNumber(process.env['PORT']),
        ssl: !hasSSLCertificateAndKey()
            ? null
            : {
                  cert: process.env['SSL_CERT_PATH'],
                  key: process.env['SSL_KEY_PATH'],
              },
    }) satisfies AppConfig;

const appConfigSchema = Joi.object({
    HOST: Joi.string().hostname().default('0.0.0.0'),
    PORT: Joi.number().port().default(3000),
    SSL_CERT_PATH: Joi.string(),
    SSL_KEY_PATH: Joi.string(),
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

export const provideThrottlerGuard: () => ClassProvider = () => ({
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
});

export const throttlerOptions: ThrottlerModuleOptions = {
    throttlers: [
        {
            ttl: minutes(1),
            limit: 100,
        },
        {
            ttl: seconds(1),
            limit: 10,
        },
    ],
};
