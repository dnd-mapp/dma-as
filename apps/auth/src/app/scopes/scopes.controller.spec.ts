import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ScopesController } from './scopes.controller';

describe('ScopesController', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            controller: module.get(ScopesController),
        };
    }

    it('should be defined', async () => {
        const { controller } = await setupTest();
        expect(controller).toBeDefined();
    });
});
