import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database';
import { LoggingModule } from '../logging';
import { UsersModule } from './users.module';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
    async function setupTest() {
        const module: TestingModule = await Test.createTestingModule({
            imports: [UsersModule, DatabaseModule, LoggingModule],
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
