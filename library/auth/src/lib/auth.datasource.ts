import { validateEnv } from '@tc/config';
import { DataSource } from 'typeorm';

export const env = validateEnv(process.env);

/** Used by the Better Auth CLI — no entity globs; Node cannot load decorator TS at runtime. */
export const dataSource = new DataSource({
    type: 'postgres',
    url: env.DATABASE_URL,
});

await dataSource.initialize();
