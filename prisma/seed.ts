import { NestFactory } from '@nestjs/core';
import { AppModule, ClientsService, UsersService } from '../src';

async function main() {
    const app = await NestFactory.create(AppModule);
    const usersService = app.get(UsersService);
    const clientsService = app.get(ClientsService);

    await usersService.create({ username: 'Admin', password: 'changemenow' });
    await clientsService.create({
        audience: 'dnd-mapp/authorization-server',
        redirectURLs: [
            { url: 'https://localhost.auth.dndmapp.net/app' },
            { url: 'https://auth.dndmapp.nl.eu.org/app' },
        ],
    });

    await app.close();
}

(async () => {
    try {
        await main();
    } catch (error) {
        console.error(error);
    }
})();
