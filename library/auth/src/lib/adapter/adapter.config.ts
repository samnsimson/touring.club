import { DBAdapterDebugLogOption } from 'better-auth/adapters';

export interface AdapterConfig {
    usePlural?: boolean;
    useDebugLog?: DBAdapterDebugLogOption;
    transaction?: boolean;
    /** Base directory for generated files. Default: `library/database/src` */
    outputDir?: string;
    /** Directory for generated entity files. Default: `{outputDir}/entities` */
    entitiesDir?: string;
}
