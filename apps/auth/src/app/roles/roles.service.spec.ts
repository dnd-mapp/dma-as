import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { RolesService } from './roles.service';

describe('RolesService', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        return {
            service: module.get(RolesService),
        };
    }

    it('should be defined', async () => {
        const { service } = await setupTest();
        expect(service).toBeDefined();
    });
});
