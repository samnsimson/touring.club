const { createLibJestConfig } = require('../../../jest/create-lib-jest-config.cjs');
module.exports = { ...createLibJestConfig('client-api', __dirname), passWithNoTests: true };
