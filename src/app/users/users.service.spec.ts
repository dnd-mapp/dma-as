import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database';
import { LoggingModule } from '../logging';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

describe('UsersService', () => {
    async function setupTest() {
        const module: TestingModule = await Test.createTestingModule({
            imports: [UsersModule, DatabaseModule, LoggingModule],
        }).compile();

        return {
            service: module.get(UsersService),
        };
    }

    it('should be defined', async () => {
        const { service } = await setupTest();
        expect(service).toBeDefined();
    });
});
