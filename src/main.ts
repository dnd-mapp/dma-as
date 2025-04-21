import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { readFile } from 'fs/promises';
import { AppModule, SSLConfig } from './app';
import { DmaLogger } from './app/logging';

async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(AppModule, {
        logger: false,
    });
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

    await appContext.close();

    const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
        bufferLogs: true,
    });
    const logger = app.get(DmaLogger);

    app.useLogger(logger);

    await app.listen(port, host);
    logger.log(
        `Server started on address: "http${ssl ? 's' : ''}://${host === '0.0.0.0' ? 'localhost' : host}:${port}"`,
        'NestApplication'
    );
}

(async () => {
    try {
        await bootstrap();
    } catch (error) {
        console.error(error);
    }
})();
