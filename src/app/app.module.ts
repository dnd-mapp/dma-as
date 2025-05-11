import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthenticationModule } from './authentication';
import { ClientsModule } from './clients';
import { configOptions, jwtOptions, provideThrottlerGuard, throttlerOptions } from './config';
import { DatabaseModule } from './database';
import { KeysModule } from './keys';
import { LoggingModule } from './logging';
import { RolesModule } from './roles';
import { UsersModule } from './users';
import { WellKnownController } from './well-known.controller';

@Module({
    imports: [
        ConfigModule.forRoot(configOptions),
        ThrottlerModule.forRoot(throttlerOptions),
        JwtModule.registerAsync(jwtOptions),
        ScheduleModule.forRoot(),
        DatabaseModule,
        LoggingModule,
        UsersModule,
        KeysModule,
        AuthenticationModule,
        ClientsModule,
        RolesModule,
    ],
    controllers: [WellKnownController],
    providers: [provideThrottlerGuard()],
})
export class AppModule {}
