import { spawnSync } from 'node:child_process';

/** Run TypeORM migrations via the bundled CommonJS runner (avoids Bun ESM circular entity imports). */
export function runDatabaseMigrations(workspaceRoot = process.cwd()): void {
    const result = spawnSync('bun', ['nx', 'run', 'database:migration:run'], {
        cwd: workspaceRoot,
        stdio: 'inherit',
        env: process.env,
    });
    if (result.status !== 0) {
        throw new Error('Database migrations failed during e2e global setup');
    }
}
