import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configOptions, provideThrottlerGuard, throttlerOptions } from './config';
import { DatabaseModule } from './database';
import { LoggingModule } from './logging';
import { UsersModule } from './users';

@Module({
    imports: [
        ConfigModule.forRoot(configOptions),
        ThrottlerModule.forRoot(throttlerOptions),
        DatabaseModule,
        UsersModule,
        LoggingModule,
    ],
    controllers: [AppController],
    providers: [AppService, provideThrottlerGuard()],
})
export class AppModule {}
