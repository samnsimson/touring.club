import { validateEnv } from '@tc/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from '@tc/utils';

export const env = validateEnv(process.env);

export const dataSource = new DataSource({
    type: 'postgres',
    url: env.DATABASE_URL,
    namingStrategy: new SnakeNamingStrategy(),
});

await dataSource.initialize();
