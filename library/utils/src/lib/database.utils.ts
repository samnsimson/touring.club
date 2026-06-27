import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from './utils';
import { join } from 'node:path';

export type DatabaseUtilsOptions = {
    url: string;
    env: 'development' | 'production' | 'staging' | 'test';
    schema?: string;
    loadEntities?: boolean;
};

export class DatabaseUtils {
    static createDataSourceOptions({ url, env, schema, loadEntities = true }: DatabaseUtilsOptions): DataSourceOptions {
        return {
            url,
            type: 'postgres',
            synchronize: false,
            logging: env !== 'production',
            namingStrategy: new SnakeNamingStrategy(),
            migrations: [join(process.cwd(), 'library/database/src/migrations/*.{ts,js}')],
            ...(schema ? { schema } : {}),
            ...(loadEntities && {
                entities: [join(process.cwd(), 'library/database/src/entities/**/*.{ts,js}')],
            }),
        };
    }

    static createDataSource(options: DatabaseUtilsOptions): DataSource {
        return new DataSource(this.createDataSourceOptions(options));
    }
}
