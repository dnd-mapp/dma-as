import { Test } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [UsersModule],
        }).compile();

        return {
            repository: module.get(UsersRepository),
        };
    }

    it('should be defined', async () => {
        const { repository } = await setupTest();
        expect(repository).toBeDefined();
    });
});
