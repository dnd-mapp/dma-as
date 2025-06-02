import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { RolesController } from './roles.controller';

describe('RolesController', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            controller: module.get(RolesController),
        };
    }

    it('should be defined', async () => {
        const { controller } = await setupTest();
        expect(controller).toBeDefined();
    });
});
