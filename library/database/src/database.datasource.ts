import { join } from 'path';
import { DatabaseUtils } from './database.utils';
import { validateEnv } from '@tc/config';

const env = validateEnv(process.env);

export const dataSource = DatabaseUtils.createDataSource({
    entities: [join(process.cwd(), 'library/database/src/entities/**/*.entity.ts')],
    migrations: [join(process.cwd(), 'library/database/src/migrations/**/*.migration.ts')],
    migrationsRun: env.NODE_ENV === 'development',
});
