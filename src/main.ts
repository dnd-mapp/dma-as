import fastifyCookie, { FastifyCookieOptions } from '@fastify/cookie';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { readFile } from 'fs/promises';
import { AppModule, globalValidationOptions, SSLConfig } from './app';
import { DmaLogger } from './app/logging';

async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(AppModule, { logger: false });
    const configService = appContext.get(ConfigService);

    const ssl = configService.get<SSLConfig | null>('ssl');

    if (ssl) {
        ssl.cert = await readFile(ssl.cert, { encoding: 'utf8' });
        ssl.key = await readFile(ssl.key, { encoding: 'utf8' });
    }
    const fastifyAdapter = new FastifyAdapter(
        !ssl
            ? {}
            : {
                  http2: true,
                  https: {
                      cert: ssl.cert,
                      key: ssl.key,
                  },
              }
    );

    const host = configService.get<string>('host');
    const port = configService.get<number>('port');
    const allowedOrigins = configService.get<string[]>('allowedOrigins');

    const cookieOptions: FastifyCookieOptions = {
        secret: configService.get<string>('cookieSigningSecret'),
        algorithm: 'sha256',
        parseOptions: {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            signed: true,
        },
    };

    const corsOptions: CorsOptions = {
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        origin: allowedOrigins,
    };

    await appContext.close();

    const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
        cors: corsOptions,
        bufferLogs: true,
    });
    const logger = await app.resolve(DmaLogger);
    logger.setContext('NestApplication');

    app.setGlobalPrefix('/server');

    app.useLogger(logger);

    app.useGlobalPipes(new ValidationPipe(globalValidationOptions));

    await app.register(fastifyCookie, cookieOptions);

    app.enableShutdownHooks();

    await app.listen(port, host);
    logger.log(
        `Server started on address: "http${ssl ? 's' : ''}://${host === '0.0.0.0' ? 'localhost' : host}:${port}"`
    );
}

(async () => {
    try {
        await bootstrap();
    } catch (error) {
        console.error(error);
    }
})();
