import { spawnSync } from 'node:child_process';
import pg from 'pg';

const organizer = require('../fixtures/users/organizer.json') as { userId: string };

async function resetFixtureTrips(databaseUrl: string): Promise<void> {
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
        await client.query('DELETE FROM general.trips WHERE organizer_id = $1', [organizer.userId]);
    } finally {
        await client.end();
    }
}

declare global {
    var __TEARDOWN_MESSAGE__: string;
}

module.exports = async function () {
    console.log('\nSetting up trips-service e2e...\n');

    if (process.env.DATABASE_URL) {
        const result = spawnSync('bun', ['library/database/scripts/run-migrations.ts'], {
            cwd: process.cwd(),
            stdio: 'inherit',
            env: process.env,
        });
        if (result.status !== 0) throw new Error('Database migrations failed during e2e global setup');

        await resetFixtureTrips(process.env.DATABASE_URL);
    }

    globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down trips-service e2e...\n';
};
