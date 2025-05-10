import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { TokensRepository } from './tokens.repository';

describe('TokensRepository', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            repository: module.get(TokensRepository),
        };
    }

    it('should be defined', async () => {
        const { repository } = await setupTest();
        expect(repository).toBeDefined();
    });
});
