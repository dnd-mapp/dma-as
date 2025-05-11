import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ScopesRepository } from './scopes.repository';

describe('ScopesRepository', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            repository: module.get(ScopesRepository),
        };
    }

    it('should be defined', async () => {
        const { repository } = await setupTest();
        expect(repository).toBeDefined();
    });
});
