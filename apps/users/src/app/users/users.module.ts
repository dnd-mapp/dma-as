import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
    imports: [DatabaseModule],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository],
})
export class UsersModule {}
