import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database';
import { LoggingModule } from '../logging';
import { AuthenticationModule } from './authentication.module';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
    async function setupTest() {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AuthenticationModule, DatabaseModule, LoggingModule],
        }).compile();

        return {
            service: module.get(AuthenticationService),
        };
    }

    it('should be defined', async () => {
        const { service } = await setupTest();
        expect(service).toBeDefined();
    });
});
