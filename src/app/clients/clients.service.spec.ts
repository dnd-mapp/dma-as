import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ClientsService } from './clients.service';

describe('ClientsService', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            service: module.get(ClientsService),
        };
    }

    it('should be defined', async () => {
        const { service } = await setupTest();
        expect(service).toBeDefined();
    });
});
