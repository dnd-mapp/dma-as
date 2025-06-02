import type { Config } from 'jest';

export default {
    coverageDirectory: '<rootDir>/../../reports/auth',
    displayName: '@dnd-mapp/dma-as-auth',
    globalSetup: '<rootDir>/test/global-setup.ts',
    globalTeardown: '<rootDir>/test/global-teardown.ts',
    preset: '../../jest.preset.js',
    rootDir: '.',
    setupFilesAfterEnv: ['<rootDir>/test/test-setup.ts'],
    testMatch: ['<rootDir>/src/**/*.spec.ts'],
} satisfies Config;
