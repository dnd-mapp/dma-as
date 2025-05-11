import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ScopesService } from './scopes.service';

describe('ScopesService', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            service: module.get(ScopesService),
        };
    }

    it('should be defined', async () => {
        const { service } = await setupTest();
        expect(service).toBeDefined();
    });
});
