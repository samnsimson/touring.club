import { AdapterConfig } from './adapter.config';
import { createAdapterFactory } from 'better-auth/adapters';
import { DataSource } from 'typeorm';

export const typeormAdapter = (dataSource: DataSource, config: AdapterConfig) => {
    return createAdapterFactory({
        config: {
            adapterId: 'typeorm-adapter',
            adapterName: 'typeorm-adapter',
            usePlural: config.usePlural,
            debugLogs: config.useDebugLog,
            supportsUUIDs: true,
            supportsJSON: true,
        },
        adapter: (options) => {
            return {
                create: async ({ data, model, select }) => {},
                update: async ({ model, where, update }) => {},
                updateMany: async ({ model, where, update }) => {},
                delete: async ({ model, where }) => {},
                deleteMany: async ({ model, where }) => {},
                findOne: async ({ model, where, select }) => {},
                findMany: async ({ model, where, select }) => {},
                count: async ({ model, where }) => {},
            };
        },
    });
};
