import { dataSource } from './database.datasource';

await dataSource.initialize();
await dataSource.query('CREATE SCHEMA IF NOT EXISTS auth');
await dataSource.runMigrations();
await dataSource.destroy();
