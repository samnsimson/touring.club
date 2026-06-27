const { readSwcJestConfig } = require('./read-swc-config.cjs');
const { createWorkspaceModuleNameMapper } = require('./create-workspace-module-name-mapper.cjs');

/**
 * @param {string} displayName
 * @param {string} projectRoot
 * @param {{ e2eRoot?: string; supportDir?: string; testTimeout?: number; maxWorkers?: number }} [options]
 */
function createAppE2eJestConfig(displayName, projectRoot, options = {}) {
    const e2eRoot = options.e2eRoot ?? '__tests__/e2e';
    const supportDir = options.supportDir ?? `${e2eRoot}/support`;
    const swcJestConfig = readSwcJestConfig(projectRoot);

    return {
        displayName: `${displayName}-e2e`,
        preset: '../../jest.preset.js',
        roots: [`<rootDir>/${e2eRoot}`],
        globalSetup: `<rootDir>/${supportDir}/global-setup.ts`,
        globalTeardown: `<rootDir>/${supportDir}/global-teardown.ts`,
        testEnvironment: 'node',
        moduleNameMapper: createWorkspaceModuleNameMapper(projectRoot),
        transform: {
            '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
            '^.+\\.mjs$': ['@swc/jest', { ...swcJestConfig, module: { type: 'commonjs' } }],
        },
        transformIgnorePatterns: ['<rootDir>/__jest_never_ignore__'],
        moduleFileExtensions: ['ts', 'js', 'mjs', 'html'],
        coverageDirectory: 'test-output/jest/coverage',
        testTimeout: options.testTimeout ?? 30_000,
        maxWorkers: options.maxWorkers ?? 1,
    };
}

module.exports = { createAppE2eJestConfig };
