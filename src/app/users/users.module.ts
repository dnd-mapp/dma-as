import { Module } from '@nestjs/common';
import { RolesModule } from '../roles';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
    imports: [RolesModule],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository],
    exports: [UsersService],
})
export class UsersModule {}
