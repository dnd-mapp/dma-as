import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { KeysRepository } from './keys.repository';

describe('KeysRepository', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            repository: module.get(KeysRepository),
        };
    }

    it('should be defined', async () => {
        const { repository } = await setupTest();
        expect(repository).toBeDefined();
    });
});
