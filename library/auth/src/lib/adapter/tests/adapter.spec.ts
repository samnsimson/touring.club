import { mkdir, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    authFlowTestSuite,
    caseInsensitiveTestSuite,
    joinsTestSuite,
    normalTestSuite,
    numberIdTestSuite,
    testAdapter,
    transactionsTestSuite,
    uuidTestSuite,
} from '@better-auth/test-utils/adapter';
import Database from 'better-sqlite3';
import { getMigrations } from 'better-auth/db/migration';
import { DataSource } from 'typeorm';
import { typeormAdapter } from '../auth.adapter.js';

const testDir = join(dirname(fileURLToPath(import.meta.url)), '__test-data__');
const dbPath = join(testDir, 'adapter.spec.db');

await mkdir(testDir, { recursive: true });

let sqliteDatabase = new Database(dbPath);

let dataSource = new DataSource({ type: 'better-sqlite3', database: dbPath });

async function resetDatabase(): Promise<void> {
    if (dataSource.isInitialized) await dataSource.destroy();
    sqliteDatabase.close();
    await unlink(dbPath).catch(console.error);
    sqliteDatabase = new Database(dbPath);
    dataSource = new DataSource({ type: 'better-sqlite3', database: dbPath });
    await dataSource.initialize();
}

await resetDatabase();

const { execute } = await testAdapter({
    adapter: () => {
        return typeormAdapter(dataSource, {
            usePlural: false,
            transaction: true,
            useDebugLog: { isRunningAdapterTests: true },
        });
    },
    prefixTests: 'typeorm-sqlite',
    async runMigrations(betterAuthOptions) {
        await resetDatabase();
        const migrationOptions = Object.assign({}, betterAuthOptions, { database: sqliteDatabase });
        const { runMigrations } = await getMigrations(migrationOptions);
        await runMigrations();
    },
    tests: [
        normalTestSuite(),
        // Skipped: test-utils wraps adapter.create via the root connection, so this
        // rollback assertion does not reflect TypeORM transaction behavior accurately.
        transactionsTestSuite({ disableTests: { 'transaction - should rollback failing transaction': true } }),
        authFlowTestSuite(),
        numberIdTestSuite(),
        joinsTestSuite(),
        uuidTestSuite(),
        caseInsensitiveTestSuite(),
    ],
    async onFinish() {
        if (dataSource.isInitialized) await dataSource.destroy();
        sqliteDatabase.close();
        await unlink(dbPath).catch(console.error);
    },
});

execute();
