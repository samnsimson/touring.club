const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const workspaceJestDir = __dirname;

function readSwcJestConfig(projectRoot) {
    const swcrcPath = [join(projectRoot, '.spec.swcrc'), join(workspaceJestDir, '.spec.swcrc')].find(existsSync);
    if (!swcrcPath) throw new Error(`No .spec.swcrc found for Jest project at ${projectRoot}`);
    const swcJestConfig = JSON.parse(readFileSync(swcrcPath, 'utf-8'));
    swcJestConfig.swcrc = false;
    return swcJestConfig;
}

module.exports = { readSwcJestConfig };
