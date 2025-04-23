import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configOptions } from './config';
import { DatabaseModule } from './database';
import { LoggingModule } from './logging';
import { UsersModule } from './users';

@Module({
    imports: [ConfigModule.forRoot(configOptions), DatabaseModule, UsersModule, LoggingModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
