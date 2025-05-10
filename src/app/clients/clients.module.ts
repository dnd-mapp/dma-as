import { Module } from '@nestjs/common';
import { KeysModule } from '../keys';
import { ClientsController } from './clients.controller';
import { ClientsRepository } from './clients.repository';
import { ClientsService } from './clients.service';

@Module({
    imports: [KeysModule],
    controllers: [ClientsController],
    providers: [ClientsService, ClientsRepository],
    exports: [ClientsService],
})
export class ClientsModule {}
