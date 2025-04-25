import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database';
import { LoggingModule } from '../logging';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationModule } from './authentication.module';

describe('AuthenticationController', () => {
    async function setupTest() {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AuthenticationModule, DatabaseModule, LoggingModule],
        }).compile();

        return {
            controller: module.get(AuthenticationController),
        };
    }

    it('should be defined', async () => {
        const { controller } = await setupTest();
        expect(controller).toBeDefined();
    });
});
