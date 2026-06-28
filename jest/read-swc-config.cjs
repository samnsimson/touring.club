const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const workspaceJestDir = __dirname;

function readSwcJestConfig(projectRoot, configFileName = '.spec.swcrc') {
    const swcrcPath = [join(projectRoot, configFileName), join(workspaceJestDir, configFileName)].find(existsSync);
    if (!swcrcPath) throw new Error(`No ${configFileName} found for Jest project at ${projectRoot}`);
    const swcJestConfig = JSON.parse(readFileSync(swcrcPath, 'utf-8'));
    swcJestConfig.swcrc = false;
    return swcJestConfig;
}

function readE2eSwcJestConfig(projectRoot) {
    return readSwcJestConfig(projectRoot, '.e2e.swcrc');
}

function readE2eDatabaseSwcJestConfig(projectRoot) {
    return readSwcJestConfig(projectRoot, '.e2e-database.swcrc');
}

module.exports = { readSwcJestConfig, readE2eSwcJestConfig, readE2eDatabaseSwcJestConfig };
