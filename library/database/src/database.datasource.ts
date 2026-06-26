import { validateEnv } from '@tc/config';
import { DatabaseUtils } from '@tc/utils';

const env = validateEnv(process.env);

export const dataSource = DatabaseUtils.createDataSource({
    url: env.DATABASE_URL,
    env: env.NODE_ENV,
    schema: 'auth',
});
