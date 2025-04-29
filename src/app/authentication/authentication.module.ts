import { Global, Module } from '@nestjs/common';
import { UsersModule } from '../users';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { AuthorizationRepository } from './authorization.repository';
import { TokensRepository } from './tokens.repository';
import { TokensService } from './tokens.service';

@Global()
@Module({
    imports: [UsersModule],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, AuthorizationRepository, TokensService, TokensRepository],
    exports: [AuthenticationService, TokensService],
})
export class AuthenticationModule {}
