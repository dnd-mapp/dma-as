import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { EmailService } from './email.service';

describe('EmailService', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            service: module.get(EmailService),
        };
    }

    it('should be defined', async () => {
        const { service } = await setupTest();
        expect(service).toBeDefined();
    });
});
