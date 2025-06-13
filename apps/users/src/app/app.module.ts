import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users';

@Module({
    imports: [UsersModule],
    controllers: [AppController],
})
export class AppModule {}
