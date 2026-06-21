import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { validateEnv } from '@tc/config';
import { SnakeNamingStrategy } from '@tc/utils';

type DatabaseUtilsOptions = TypeOrmModuleOptions & {
    url?: string;
};
const env = validateEnv(process.env);

export class DatabaseUtils {
    static createDataSourceOptions(options: DatabaseUtilsOptions): TypeOrmModuleOptions {
        return {
            type: options.type as 'postgres',
            url: options.url ?? env.DATABASE_URL,
            entities: options.entities,
            namingStrategy: new SnakeNamingStrategy(),
            synchronize: options.synchronize,
            logging: options.logging,
            logger: options.logger,
        };
    }
    static createDataSource(options: DatabaseUtilsOptions): DataSource {
        const dataSourceOptions = this.createDataSourceOptions(options);
        return new DataSource(dataSourceOptions as DataSourceOptions);
    }
}
