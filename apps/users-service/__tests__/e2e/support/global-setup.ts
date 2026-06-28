import { spawnSync } from 'node:child_process';

declare global {
    var __TEARDOWN_MESSAGE__: string;
}

module.exports = async function () {
    console.log('\nSetting up users-service e2e...\n');

    if (process.env.DATABASE_URL) {
        const result = spawnSync('bun', ['library/database/scripts/run-migrations.ts'], {
            cwd: process.cwd(),
            stdio: 'inherit',
            env: process.env,
        });
        if (result.status !== 0) throw new Error('Database migrations failed during e2e global setup');
    }

    globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down users-service e2e...\n';
};
