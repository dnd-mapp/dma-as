const nxPreset = require('@nx/jest/preset').default;

module.exports = {
    ...nxPreset,
    clearMocks: true,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/*.ts',
        '!<rootDir>/src/**/index.ts',
        '!<rootDir>/src/*.d.ts',
    ],
    collectCoverage: true,
    coverageDirectory: 'reports/coverage',
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
    randomize: true,
    showSeed: true,
};
