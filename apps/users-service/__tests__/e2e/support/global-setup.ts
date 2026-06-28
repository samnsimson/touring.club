import pg from 'pg';
import { runDatabaseMigrations } from '@tc/testing';

const defaultUser = require('../fixtures/users/default-user.json') as { userId: string };
const viewerUser = require('../fixtures/users/viewer-user.json') as { userId: string };

async function resetFixtureProfiles(databaseUrl: string): Promise<void> {
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
        await client.query('DELETE FROM general.profiles WHERE user_id = ANY($1)', [[defaultUser.userId, viewerUser.userId]]);
    } finally {
        await client.end();
    }
}

declare global {
    var __TEARDOWN_MESSAGE__: string;
}

module.exports = async function () {
    console.log('\nSetting up users-service e2e...\n');

    if (process.env.DATABASE_URL) {
        runDatabaseMigrations();
        await resetFixtureProfiles(process.env.DATABASE_URL);
    }

    globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down users-service e2e...\n';
};
