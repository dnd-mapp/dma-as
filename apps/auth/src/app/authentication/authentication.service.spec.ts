import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
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
