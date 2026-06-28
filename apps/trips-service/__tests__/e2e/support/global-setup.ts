import pg from 'pg';
import { runDatabaseMigrations } from '@tc/testing';

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
        runDatabaseMigrations();
        await resetFixtureTrips(process.env.DATABASE_URL);
    }

    globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down trips-service e2e...\n';
};
