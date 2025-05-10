import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { KeysService } from './keys.service';

describe('KeysService', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            service: module.get(KeysService),
        };
    }

    it('should be defined', async () => {
        const { service } = await setupTest();
        expect(service).toBeDefined();
    });
});
