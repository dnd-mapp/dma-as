import { Module } from '@nestjs/common';
import { KeysRepository } from './keys.repository';
import { KeysService } from './keys.service';
import { keyStoreProvider } from './providers';

@Module({
    providers: [keyStoreProvider, KeysRepository, KeysService],
    exports: [KeysService],
})
export class KeysModule {}
