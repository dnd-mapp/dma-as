import { Module } from '@nestjs/common';
import { KeysModule } from '../keys';
import { RolesModule } from '../roles';
import { UsersModule } from '../users';
import { TokensRepository } from './tokens.repository';
import { TokensService } from './tokens.service';

@Module({
    imports: [KeysModule, UsersModule, RolesModule],
    providers: [TokensRepository, TokensService],
    exports: [TokensService],
})
export class TokensModule {}
