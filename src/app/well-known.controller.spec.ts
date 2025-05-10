import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { WellKnownController } from './well-known.controller';

describe('WellKnownController', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            controller: module.get(WellKnownController),
        };
    }

    it('should be defined', async () => {
        const { controller } = await setupTest();
        expect(controller).toBeDefined();
    });
});
