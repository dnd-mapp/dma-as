import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { TokensService } from './tokens.service';

describe('TokensService', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            service: module.get(TokensService),
        };
    }

    it('should be defined', async () => {
        const { service } = await setupTest();
        expect(service).toBeDefined();
    });
});
