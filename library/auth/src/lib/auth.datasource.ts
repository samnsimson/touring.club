import { validateEnv } from '@tc/config';
import { DatabaseUtils } from '@tc/utils';

export const env = validateEnv(process.env);

export const dataSource = DatabaseUtils.createDataSource({
    schema: 'auth',
    env: env.NODE_ENV,
    url: env.DATABASE_URL,
    loadEntities: false,
});

await dataSource.initialize();
