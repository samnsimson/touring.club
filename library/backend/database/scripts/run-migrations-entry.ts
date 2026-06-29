import { dataSource } from './database.datasource';

void (async () => {
    await dataSource.initialize();
    await dataSource.query('CREATE SCHEMA IF NOT EXISTS auth');
    await dataSource.runMigrations();
    await dataSource.destroy();
})().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
