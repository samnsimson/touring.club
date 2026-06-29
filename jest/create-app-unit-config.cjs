const { join, relative } = require('path');
const { readSwcJestConfig } = require('./read-swc-config.cjs');

/** @param {string} displayName @param {string} projectRoot */
function createAppUnitJestConfig(displayName, projectRoot) {
    return {
        displayName,
        preset: relative(projectRoot, join(__dirname, '..', 'jest.preset.js')),
        testEnvironment: 'node',
        roots: ['<rootDir>/__tests__/unit'],
        transform: {
            '^.+\\.[tj]s$': ['@swc/jest', readSwcJestConfig(projectRoot)],
        },
        moduleFileExtensions: ['ts', 'js', 'html'],
        coverageDirectory: 'test-output/jest/coverage',
        collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.dto.ts', '!src/**/dto/**', '!src/main.ts', '!src/entities/**'],
        coverageThreshold: {
            global: {
                statements: 100,
                lines: 100,
                functions: 100,
            },
        },
    };
}

module.exports = { createAppUnitJestConfig };
