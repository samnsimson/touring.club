import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from './utils';
import { join } from 'node:path';

export type DatabaseUtilsOptions = {
    url: string;
    env: 'development' | 'production' | 'staging' | 'test';
    schema?: string;
};

export class DatabaseUtils {
    static createDataSourceOptions({ url, env, schema }: DatabaseUtilsOptions): DataSourceOptions {
        return {
            url,
            type: 'postgres',
            ...(schema ? { schema } : {}),
            namingStrategy: new SnakeNamingStrategy(),
            entities: [join(process.cwd(), 'library/database/src/entities/**/*.{ts,js}')],
            migrations: [join(process.cwd(), 'library/database/src/migrations/*.{ts,js}')],
            migrationsRun: env === 'development',
            logging: env !== 'production',
            synchronize: false,
        };
    }

    static createDataSource(options: DatabaseUtilsOptions): DataSource {
        return new DataSource(this.createDataSourceOptions(options));
    }
}
