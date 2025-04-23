import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database';
import { LoggingModule } from '../logging';
import { UsersController } from './users.controller';
import { UsersModule } from './users.module';

describe('UsersController', () => {
    async function setupTest() {
        const module: TestingModule = await Test.createTestingModule({
            imports: [UsersModule, DatabaseModule, LoggingModule],
        }).compile();

        return {
            controller: module.get(UsersController),
        };
    }

    it('should be defined', async () => {
        const { controller } = await setupTest();
        expect(controller).toBeDefined();
    });
});
