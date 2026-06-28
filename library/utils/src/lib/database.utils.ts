import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from './utils';

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
            synchronize: false,
            logging: env !== 'production',
            namingStrategy: new SnakeNamingStrategy(),
            ...(schema ? { schema } : {}),
        };
    }

    static createDataSource(options: DatabaseUtilsOptions): DataSource {
        return new DataSource(this.createDataSourceOptions(options));
    }
}
