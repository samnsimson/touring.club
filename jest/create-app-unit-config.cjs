const { readSwcJestConfig } = require('./read-swc-config.cjs');

/** @param {string} displayName @param {string} projectRoot */
function createAppUnitJestConfig(displayName, projectRoot) {
    return {
        displayName,
        preset: '../../jest.preset.js',
        testEnvironment: 'node',
        roots: ['<rootDir>/__tests__/unit'],
        transform: {
            '^.+\\.[tj]s$': ['@swc/jest', readSwcJestConfig(projectRoot)],
        },
        moduleFileExtensions: ['ts', 'js', 'html'],
        coverageDirectory: 'test-output/jest/coverage',
    };
}

module.exports = { createAppUnitJestConfig };
