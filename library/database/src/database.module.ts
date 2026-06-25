import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@tc/config';
import { DatabaseModuleOptions } from './database.contract';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DatabaseUtils } from '@tc/utils';

@Module({})
export class DatabaseModule {
    static forRootAsync(options: DatabaseModuleOptions = {}): DynamicModule {
        return {
            global: true,
            module: DatabaseModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: (config: ConfigService) => {
                        const schema = 'auth';
                        const url = config.get('DATABASE_URL');
                        const env = config.get('NODE_ENV');
                        const dataSourceOptions = DatabaseUtils.createDataSourceOptions({ url, env, schema });
                        return { ...dataSourceOptions, autoLoadEntities: true };
                    },
                    dataSourceFactory: async (options?: DataSourceOptions) => {
                        if (!options) throw new Error('DataSourceOptions are required');
                        const dataSource = new DataSource(options);
                        await dataSource.initialize();
                        return dataSource;
                    },
                }),
                ...(options.imports ?? []),
            ],
            providers: [...(options.providers ?? [])],
            exports: [TypeOrmModule, ...(options.exports ?? [])],
        };
    }
}
