import type { Config } from 'jest';
import baseJestConfig from '../../jest.config';

const jestConfig: Config = {
    ...baseJestConfig,
    coverageDirectory: '<rootDir>/../../reports/auth',
    displayName: 'Auth',
    globalSetup: '<rootDir>/test/global-setup.ts',
    globalTeardown: '<rootDir>/test/global-teardown.ts',
    rootDir: '.',
    setupFilesAfterEnv: ['<rootDir>/test/test-setup.ts'],
    testMatch: ['<rootDir>/src/**/*.spec.ts'],
};

export default jestConfig;
