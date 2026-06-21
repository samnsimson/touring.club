import { validateEnv } from '@tc/config';
import { DataSource } from 'typeorm';

export const env = validateEnv(process.env);

export const dataSource = new DataSource({
    type: 'postgres',
    url: env.DATABASE_URL,
});

await dataSource.initialize();
