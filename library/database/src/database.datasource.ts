import { join } from 'node:path';
import { validateEnv } from '@tc/config';
import { DatabaseUtils } from './database.utils.js';

const env = validateEnv(process.env);

export const dataSource = DatabaseUtils.createDataSource({
    entities: [join(process.cwd(), 'library/database/src/entities/**/*.ts')],
    migrations: [join(process.cwd(), 'library/database/src/migrations/*.ts')],
    migrationsRun: env.NODE_ENV === 'development',
});
