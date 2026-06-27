/* eslint-disable @typescript-eslint/no-unused-vars */
const WORKSPACE_LIBS = ['auth', 'core', 'config', 'database', 'utils', 'testing', 'common'];

/** @param {string} projectRoot App project root (e.g. apps/auth-service) — unused; mapper uses Jest `<rootDir>` */
function createWorkspaceModuleNameMapper(_projectRoot) {
    return Object.fromEntries(WORKSPACE_LIBS.map((lib) => [`^@tc/${lib}$`, `<rootDir>/../../library/${lib}/src/index.ts`]));
}

module.exports = { createWorkspaceModuleNameMapper };
