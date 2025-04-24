import { ClassProvider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { minutes, seconds, ThrottlerGuard, ThrottlerModuleOptions } from '@nestjs/throttler';

export const provideThrottlerGuard: () => ClassProvider = () => ({
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
});

export const throttlerOptions: ThrottlerModuleOptions = {
    throttlers: [
        {
            ttl: minutes(1),
            limit: 100,
        },
        {
            ttl: seconds(1),
            limit: 10,
        },
    ],
};
