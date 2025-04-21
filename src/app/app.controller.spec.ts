import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppModule } from './app.module';

describe('AppController', () => {
    async function setupTest() {
        const app = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            appController: app.get(AppController),
        };
    }

    it('should return "Hello World!"', async () => {
        const { appController } = await setupTest();

        expect(appController.getHello()).toBe('Hello World!');
    });
});
