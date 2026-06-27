const { readSwcJestConfig } = require('./read-swc-config.cjs');

/**
 * @param {string} displayName
 * @param {string} projectRoot
 * @param {{ e2eRoot?: string; supportDir?: string; testTimeout?: number; maxWorkers?: number }} [options]
 */
function createAppE2eJestConfig(displayName, projectRoot, options = {}) {
    const e2eRoot = options.e2eRoot ?? '__tests__/e2e';
    const supportDir = options.supportDir ?? `${e2eRoot}/support`;

    return {
        displayName: `${displayName}-e2e`,
        preset: '../../jest.preset.js',
        roots: [`<rootDir>/${e2eRoot}`],
        globalSetup: `<rootDir>/${supportDir}/global-setup.ts`,
        globalTeardown: `<rootDir>/${supportDir}/global-teardown.ts`,
        setupFiles: [`<rootDir>/${supportDir}/test-setup.ts`],
        testEnvironment: 'node',
        transform: {
            '^.+\\.[tj]s$': ['@swc/jest', readSwcJestConfig(projectRoot)],
        },
        moduleFileExtensions: ['ts', 'js', 'html'],
        coverageDirectory: 'test-output/jest/coverage',
        testTimeout: options.testTimeout ?? 30_000,
        maxWorkers: options.maxWorkers ?? 1,
    };
}

module.exports = { createAppE2eJestConfig };
