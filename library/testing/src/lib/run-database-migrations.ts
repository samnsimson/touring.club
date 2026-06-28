import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_SCRIPT = 'library/database/dist/scripts/run-migrations.cjs';

function ensureMigrationRunnerBuilt(workspaceRoot: string): void {
    const scriptPath = join(workspaceRoot, MIGRATIONS_SCRIPT);
    if (existsSync(scriptPath)) return;

    const build = spawnSync('bun', ['nx', 'run', 'database:build-migrations'], {
        cwd: workspaceRoot,
        stdio: 'inherit',
        env: { ...process.env, NX_DAEMON: 'false' },
    });
    if (build.status !== 0 || !existsSync(scriptPath)) {
        throw new Error(`Failed to build migration runner at ${MIGRATIONS_SCRIPT}`);
    }
}

/** Run TypeORM migrations via the bundled CommonJS runner (avoids Bun ESM circular entity imports and nested Nx recursion). */
export function runDatabaseMigrations(workspaceRoot = process.cwd()): void {
    ensureMigrationRunnerBuilt(workspaceRoot);

    const result = spawnSync('bun', ['--env-file=.env', MIGRATIONS_SCRIPT], {
        cwd: workspaceRoot,
        stdio: 'inherit',
        env: process.env,
    });
    if (result.status !== 0) {
        throw new Error('Database migrations failed during e2e global setup');
    }
}
