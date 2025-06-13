import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersModule } from './users.module';

describe('UsersController', () => {
    async function setupTest() {
        const app = await Test.createTestingModule({
            imports: [UsersModule],
        }).compile();

        return {
            controller: app.get(UsersController),
        };
    }

    it('should be defined', async () => {
        const { controller } = await setupTest();
        expect(controller).toBeDefined();
    });
});
