import type { Config } from 'jest';

const jestConfig: Config = {
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: 'reports/dma-as',
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testEnvironment: 'node',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
};

export default jestConfig;
