import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthenticationMiddleware, AuthenticationModule } from './authentication';
import { configOptions, jwtOptions, provideThrottlerGuard, throttlerOptions } from './config';
import { DatabaseModule } from './database';
import { LoggingModule } from './logging';
import { UsersModule } from './users';

@Module({
    imports: [
        ConfigModule.forRoot(configOptions),
        ThrottlerModule.forRoot(throttlerOptions),
        JwtModule.registerAsync(jwtOptions),
        DatabaseModule,
        UsersModule,
        LoggingModule,
        AuthenticationModule,
    ],
    providers: [provideThrottlerGuard()],
})
export class AppModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthenticationMiddleware)
            .exclude(
                { path: '/auth/login', method: RequestMethod.POST },
                { path: '/auth/sign-up', method: RequestMethod.POST }
            )
            .forRoutes('*');
    }
}
