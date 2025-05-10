import { Module } from '@nestjs/common';
import { KeysModule } from '../keys';
import { TokensRepository } from './tokens.repository';
import { TokensService } from './tokens.service';

@Module({
    imports: [KeysModule],
    providers: [TokensRepository, TokensService],
    exports: [TokensService],
})
export class TokensModule {}
