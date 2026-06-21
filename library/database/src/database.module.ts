import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@tc/config';
import { DatabaseModuleOptions } from './database.contract';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DatabaseUtils } from './database.utils';

@Module({})
export class DatabaseModule {
    static forRootAsync(options: DatabaseModuleOptions = {}): DynamicModule {
        return {
            global: true,
            module: DatabaseModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    inject: [ConfigService],
                    useFactory: (config: ConfigService) => {
                        return DatabaseUtils.createDataSourceOptions({
                            autoLoadEntities: true,
                            url: config.get('DATABASE_URL'),
                            synchronize: config.get('NODE_ENV') === 'development',
                            ...(options.options ?? {}),
                        });
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
