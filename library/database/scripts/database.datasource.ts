import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { validateEnv } from '@tc/config';
import { DatabaseUtils } from '@tc/utils';
import { ENTITIES } from '../src/entities';

const env = validateEnv(process.env);

/** TypeORM CLI data source — used by `migration:generate` and `run-migrations.ts`. */
export const dataSource = new DataSource({
    ...DatabaseUtils.createDataSourceOptions({ url: env.DATABASE_URL, env: env.NODE_ENV, loadEntities: false }),
    entities: ENTITIES,
    migrations: [join(process.cwd(), 'library/database/src/migrations/*.{ts,js}')],
});
