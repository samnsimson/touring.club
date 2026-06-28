const { createAppE2eJestConfig } = require('../../jest/create-app-e2e-config.cjs');

module.exports = createAppE2eJestConfig('users-service', __dirname);
