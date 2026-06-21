import { createAdapterFactory } from 'better-auth/adapters';
import { DataSource } from 'typeorm';
import { AdapterConfig } from './adapter.config';
import { getDatabaseType } from './query/where-clause';
import {
    assertDataSourceInitialized,
    createAdapterOptions,
    createBaseAdapterConfig,
    createCustomAdapterFactory,
    LazyAdapterOptions,
} from './core/adapter-factory';

export const typeormAdapter = (dataSource: DataSource, config: AdapterConfig = {}) => {
    assertDataSourceInitialized(dataSource);

    let lazyOptions: LazyAdapterOptions | null = null;
    const dbType = getDatabaseType(dataSource.options.type);
    const baseAdapterConfig = createBaseAdapterConfig(config, dbType);
    const createCustomAdapter = createCustomAdapterFactory({ dbType, config });

    const adapter = createAdapterFactory(
        createAdapterOptions({
            baseAdapterConfig,
            createCustomAdapter,
            dataSource,
            transactionEnabled: config.transaction ?? false,
            getLazyOptions: () => lazyOptions,
        }),
    );

    return (options: Parameters<typeof adapter>[0]) => {
        lazyOptions = options;
        return adapter(options);
    };
};
