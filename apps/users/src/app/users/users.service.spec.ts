import { Test } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

describe('UsersService', () => {
    async function setupTest() {
        const module = await Test.createTestingModule({
            imports: [UsersModule],
        }).compile();

        return {
            service: module.get(UsersService),
        };
    }

    it('should be defined', async () => {
        const { service } = await setupTest();
        expect(service).toBeDefined();
    });
});
