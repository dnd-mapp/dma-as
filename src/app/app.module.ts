import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configOptions } from './config';
import { DmaLogger } from './logging';

@Module({
    imports: [ConfigModule.forRoot(configOptions)],
    controllers: [AppController],
    providers: [AppService, DmaLogger],
    exports: [DmaLogger],
})
export class AppModule {}
