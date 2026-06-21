import { BetterAuthError } from 'better-auth';
import { createAdapterFactory } from 'better-auth/adapters';
import type { AdapterFactoryConfig, AdapterFactoryOptions, DBTransactionAdapter } from 'better-auth/adapters';
import { DataSource, EntityManager } from 'typeorm';
import { AdapterConfig } from '../adapter.config';
import { createTypeormAdapterMethods } from './adapter-methods';
import { createTypeormSchema } from '../schema/create-schema';

export type LazyAdapterOptions = Parameters<ReturnType<typeof createAdapterFactory>>[0];

type CustomAdapterCreator = AdapterFactoryOptions['adapter'];

export function assertDataSourceInitialized(dataSource: DataSource): void {
    if (!dataSource.isInitialized) {
        throw new BetterAuthError('TypeORM DataSource is not initialized. Call `await dataSource.initialize()` before creating the adapter.');
    }
}

export function createBaseAdapterConfig(config: AdapterConfig, dbType: string): Omit<AdapterFactoryConfig, 'transaction'> {
    return {
        adapterId: 'typeorm-adapter',
        adapterName: 'typeorm-adapter',
        usePlural: config.usePlural,
        debugLogs: config.useDebugLog,
        supportsUUIDs: false,
        supportsJSON: dbType === 'postgres',
        supportsDates: dbType !== 'sqlite' && dbType !== 'mssql',
        supportsBooleans: dbType !== 'sqlite' && dbType !== 'mssql' && dbType !== 'mysql' && dbType !== 'mariadb',
    };
}

export function createCustomAdapterFactory({
    dbType,
    config,
}: {
    dbType: string;
    config: AdapterConfig;
}): (manager: EntityManager, inTransaction?: boolean) => CustomAdapterCreator {
    return (manager, inTransaction = false) =>
        ({ getFieldName, getModelName, getDefaultModelName, getFieldAttributes, schema }) => {
            const context = { getFieldName, getModelName, getDefaultModelName, getFieldAttributes, schema };

            return {
                ...createTypeormAdapterMethods(manager, dbType, context, inTransaction, config),
                createSchema: async ({ file, tables }) => createTypeormSchema({ dbType, config, tables, file }),
            };
        };
}

type TransactionSupportParams = {
    enabled: boolean;
    dataSource: DataSource;
    baseAdapterConfig: Omit<AdapterFactoryConfig, 'transaction'>;
    createCustomAdapter: (manager: EntityManager, inTransaction?: boolean) => CustomAdapterCreator;
    getLazyOptions: () => LazyAdapterOptions | null;
};

export function createTransactionSupport({
    enabled,
    dataSource,
    baseAdapterConfig,
    createCustomAdapter,
    getLazyOptions,
}: TransactionSupportParams): AdapterFactoryConfig['transaction'] {
    if (!enabled) {
        return false;
    }

    return async <R>(callback: (trx: DBTransactionAdapter) => Promise<R>) => {
        const lazyOptions = getLazyOptions();
        if (!lazyOptions) {
            throw new BetterAuthError('Adapter has not been initialized yet.');
        }

        return dataSource.manager.transaction(async (activeManager) => {
            const transactionalFactory = createAdapterFactory({
                config: { ...baseAdapterConfig, transaction: false },
                adapter: createCustomAdapter(activeManager, true),
            });

            return callback(transactionalFactory(lazyOptions));
        });
    };
}

export function createAdapterOptions({
    baseAdapterConfig,
    createCustomAdapter,
    dataSource,
    transactionEnabled,
    getLazyOptions,
}: {
    baseAdapterConfig: Omit<AdapterFactoryConfig, 'transaction'>;
    createCustomAdapter: (manager: EntityManager, inTransaction?: boolean) => CustomAdapterCreator;
    dataSource: DataSource;
    transactionEnabled: boolean;
    getLazyOptions: () => LazyAdapterOptions | null;
}): AdapterFactoryOptions {
    return {
        config: {
            ...baseAdapterConfig,
            transaction: createTransactionSupport({
                enabled: transactionEnabled,
                dataSource,
                baseAdapterConfig,
                createCustomAdapter,
                getLazyOptions,
            }),
        },
        adapter: createCustomAdapter(dataSource.manager),
    };
}
