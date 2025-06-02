import { getJestProjectsAsync } from '@nx/jest';
import type { Config } from 'jest';

export default async () =>
    ({
        clearMocks: true,
        collectCoverage: true,
        collectCoverageFrom: [
            '<rootDir>/src/**/*.ts',
            '!<rootDir>/**/index.ts',
            '!<rootDir>/**/main.ts',
            '!<rootDir>/**/public_api.ts',
            '!<rootDir>/**/*.d.ts',
        ],
        coverageReporters: ['text-summary', 'html'],
        // Don't enforce code coverage for now to speed up development.
        // coverageThreshold: {
        //     global: {
        //         branches: 80,
        //         functions: 80,
        //         lines: 80,
        //         statements: 80,
        //     },
        // },
        moduleFileExtensions: ['js', 'ts'],
        projects: await getJestProjectsAsync(),
        randomize: true,
        showSeed: true,
        testEnvironment: 'node',
        transform: {
            '^.+\\.(t|j)s$': 'ts-jest',
        },
    }) satisfies Config;
