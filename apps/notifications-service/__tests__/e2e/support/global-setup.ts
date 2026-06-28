import pg from 'pg';
import { runDatabaseMigrations } from '@tc/testing';

const userA = require('../fixtures/users/user-a.json') as { userId: string };
const userB = require('../fixtures/users/user-b.json') as { userId: string };

async function resetFixtureNotifications(databaseUrl: string): Promise<void> {
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
        await client.query(`DELETE FROM general.notifications WHERE user_id = ANY($1)`, [[userA.userId, userB.userId]]);
    } finally {
        await client.end();
    }
}

declare global {
    var __TEARDOWN_MESSAGE__: string;
}

module.exports = async function () {
    console.log('\nSetting up notifications-service e2e...\n');

    if (process.env.DATABASE_URL) {
        runDatabaseMigrations();
        await resetFixtureNotifications(process.env.DATABASE_URL);
    }

    globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down notifications-service e2e...\n';
};
