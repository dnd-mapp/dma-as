import { Module } from '@nestjs/common';
import { UsersModule } from '../users';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

@Module({
    controllers: [AuthenticationController],
    imports: [UsersModule],
    providers: [AuthenticationService],
    exports: [AuthenticationService],
})
export class AuthenticationModule {}
