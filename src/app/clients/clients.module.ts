import { Module } from '@nestjs/common';
import { KeysModule } from '../keys';
import { TokensModule } from '../tokens';
import { ClientsController } from './clients.controller';
import { ClientsRepository } from './clients.repository';
import { ClientsService } from './clients.service';

@Module({
    imports: [KeysModule, TokensModule],
    controllers: [ClientsController],
    providers: [ClientsService, ClientsRepository],
    exports: [ClientsService],
})
export class ClientsModule {}
