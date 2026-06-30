const { join, relative } = require('path');

/** @param {string} displayName @param {string} projectRoot */
function createFrontendLibJestConfig(displayName, projectRoot) {
    return {
        displayName,
        preset: relative(projectRoot, join(__dirname, '..', 'jest.preset.js')),
        testEnvironment: 'jsdom',
        roots: ['<rootDir>/__tests__/unit'],
        transform: {
            '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
        },
        moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
        coverageDirectory: 'test-output/jest/coverage',
        collectCoverageFrom: ['src/**/*.{ts,tsx}'],
        passWithNoTests: true,
    };
}

module.exports = { createFrontendLibJestConfig };
