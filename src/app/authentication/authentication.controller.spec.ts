import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { AuthenticationController } from './authentication.controller';

describe('AuthenticationController', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
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
