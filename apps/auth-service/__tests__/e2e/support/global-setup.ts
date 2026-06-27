import { spawnSync } from 'node:child_process';
import pg from 'pg';

async function resetAuthJwks(databaseUrl: string): Promise<void> {
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
        await client.query('DELETE FROM auth.jwkss');
    } finally {
        await client.end();
    }
}

declare global {
    var __TEARDOWN_MESSAGE__: string;
}

module.exports = async function () {
    console.log('\nSetting up auth-service e2e...\n');

    if (process.env.DATABASE_URL) {
        const result = spawnSync('bun', ['library/database/src/run-migrations.ts'], {
            cwd: process.cwd(),
            stdio: 'inherit',
            env: process.env,
        });
        if (result.status !== 0) throw new Error('Database migrations failed during e2e global setup');

        await resetAuthJwks(process.env.DATABASE_URL);
    }

    globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down auth-service e2e...\n';
};
