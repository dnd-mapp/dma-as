import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '../clients';
import { RolesModule } from '../roles';
import { TokensModule } from '../tokens';
import { UsersModule } from '../users';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { AuthorizationRepository } from './authorization.repository';

@Global()
@Module({
    imports: [TokensModule, UsersModule, ClientsModule, RolesModule],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, AuthorizationRepository],
    exports: [AuthenticationService],
})
export class AuthenticationModule {}
