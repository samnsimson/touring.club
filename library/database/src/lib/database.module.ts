import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@tc/config';
import { DatabaseModuleOptions } from './database.contract';
import { DataSource, DataSourceOptions } from 'typeorm';

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
                        return {
                            type: 'postgres',
                            url: config.get('DATABASE_URL'),
                            autoLoadEntities: true,
                            synchronize: config.get('NODE_ENV') === 'development',
                            ...(options.options ?? {}),
                        } as TypeOrmModuleOptions;
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
