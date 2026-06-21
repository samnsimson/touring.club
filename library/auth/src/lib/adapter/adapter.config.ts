import { DBAdapterDebugLogOption } from 'better-auth/adapters';
import type { NamingStrategyInterface } from 'typeorm';

export interface AdapterConfig {
    usePlural?: boolean;
    useDebugLog?: DBAdapterDebugLogOption;
    transaction?: boolean;
    /** Base directory for generated files. Default: `library/database/src` */
    outputDir?: string;
    /** Directory for generated entity files. Default: `{outputDir}/entities` */
    entitiesDir?: string;
    /** Postgres schema for generated entities and queries. Default: `auth` */
    schema?: string;
    /** TypeORM naming strategy for generated entities and runtime queries */
    namingStrategy?: NamingStrategyInterface;
}
