import { ClassProvider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { minutes, seconds, Throttle, ThrottlerGuard, ThrottlerModuleOptions } from '@nestjs/throttler';

export const provideThrottlerGuard = () =>
    ({
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
    }) satisfies ClassProvider;

export const authenticationThrottlerOptions: Parameters<typeof Throttle>[0] = {
    default: {
        blockDuration: minutes(10),
        ttl: minutes(1),
        limit: 5,
    },
} as const;

export const throttlerOptions: ThrottlerModuleOptions = {
    throttlers: [
        {
            name: 'long',
            ttl: minutes(1),
            limit: 100,
        },
        {
            name: 'short',
            ttl: seconds(1),
            limit: 10,
        },
    ],
};
