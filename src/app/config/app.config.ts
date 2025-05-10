import { ConfigModuleOptions } from '@nestjs/config';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { IsArray, IsOptional, IsPort, IsString, MinLength, validate } from 'class-validator';
import { parseNumber } from '../utils';

const ENV_NAME_ALLOWED_ORIGINS = 'ALLOWED_ORIGINS' as const;
const ENV_NAME_COOKIE_SIGNING_SECRET = 'COOKIE_SIGNING_SECRET' as const;
const ENV_NAME_ENCRYPTION_KEY = 'ENCRYPTION_KEY' as const;
const ENV_NAME_HOST = 'HOST' as const;
const ENV_NAME_PORT = 'PORT' as const;
const ENV_NAME_SSL_CERT_PATH = 'SSL_CERT_PATH' as const;
const ENV_NAME_SSL_KEY_PATH = 'SSL_KEY_PATH' as const;

export class SSLConfig {
    cert: string;
    key: string;
}

export class AppConfig {
    allowedOrigins: string[];
    cookieSigningSecret: string;
    encryptionKey: string;
    host: string;
    port: number;
    ssl: SSLConfig | null;
}

function hasSSLCertificateAndKey() {
    return process.env[ENV_NAME_SSL_CERT_PATH] && process.env[ENV_NAME_SSL_KEY_PATH];
}

export const appConfig = () =>
    ({
        allowedOrigins: (
            process.env[ENV_NAME_ALLOWED_ORIGINS] ||
            'https://localhost.auth.dndmapp.net,https://localhost.api.dndmapp.net,https://localhost.dndmapp.net'
        ).split(','),
        cookieSigningSecret: process.env[ENV_NAME_COOKIE_SIGNING_SECRET],
        encryptionKey: process.env[ENV_NAME_ENCRYPTION_KEY],
        host: process.env[ENV_NAME_HOST],
        port: parseNumber(process.env[ENV_NAME_PORT]),
        ssl: !hasSSLCertificateAndKey()
            ? null
            : {
                  cert: process.env[ENV_NAME_SSL_CERT_PATH],
                  key: process.env[ENV_NAME_SSL_KEY_PATH],
              },
    }) satisfies AppConfig;

export class EnvironmentVariables {
    @IsString({ each: true })
    @IsArray()
    @Expose()
    @IsOptional()
    [ENV_NAME_ALLOWED_ORIGINS]: string[];

    @IsString()
    @MinLength(64)
    @Expose()
    [ENV_NAME_COOKIE_SIGNING_SECRET]: string;

    @IsString()
    @Expose()
    [ENV_NAME_ENCRYPTION_KEY]: string;

    @IsString()
    @Expose()
    @IsOptional()
    [ENV_NAME_HOST]: string;

    @IsPort()
    @Expose()
    @Type(() => String)
    @IsOptional()
    [ENV_NAME_PORT]: number;

    @IsString()
    @Expose()
    @IsOptional()
    [ENV_NAME_SSL_CERT_PATH]: string;

    @IsString()
    @Expose()
    @IsOptional()
    [ENV_NAME_SSL_KEY_PATH]: string;
}

async function validateEnvironmentVariables(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
    });

    const errors = await validate(validatedConfig, { stopAtFirstError: true });

    if (errors.length === 0) return;
    throw new Error(errors[0].toString());
}

export const configOptions: ConfigModuleOptions = {
    cache: true,
    envFilePath: ['.env'],
    expandVariables: true,
    isGlobal: true,
    load: [appConfig],
    validate: validateEnvironmentVariables,
};
