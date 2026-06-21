import { DBAdapterDebugLogOption } from 'better-auth/adapters';

export interface AdapterConfig {
    usePlural?: boolean;
    useDebugLog?: DBAdapterDebugLogOption;
    transaction?: boolean;
    outputDir?: string;
    entitiesDir?: string;
    migrationsDir?: string;
}
