import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ClientsController } from './clients.controller';

describe('ClientsController', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            controller: module.get(ClientsController),
        };
    }

    it('should be defined', async () => {
        const { controller } = await setupTest();
        expect(controller).toBeDefined();
    });
});
