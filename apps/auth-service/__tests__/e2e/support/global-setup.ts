import pg from 'pg';
import { runDatabaseMigrations } from '@tc/testing';

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
        runDatabaseMigrations();
        await resetAuthJwks(process.env.DATABASE_URL);
    }

    globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down auth-service e2e...\n';
};
