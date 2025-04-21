import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

    const port = process.env['PORT'] ?? 3000;
    const host = process.env['HOST'] ?? '0.0.0.0';

    await app.listen(port, host);
}

(async () => {
    try {
        await bootstrap();
    } catch (error) {
        console.error(error);
    }
})();
