import type { EntityManager } from 'typeorm';

export const PRIMARY_ALIAS = 'base';

export type AdapterContext = {
    getFieldName: (args: { model: string; field: string }) => string;
    getModelName: (model: string) => string;
    getDefaultModelName: (model: string) => string;
    getFieldAttributes: (args: { model: string; field: string }) => { unique?: boolean; fieldName?: string };
    schema: Record<string, { fields?: Record<string, { fieldName?: string }> }>;
};

export type AdapterRuntime = {
    manager: EntityManager;
    dbType: string;
    context: AdapterContext;
    inTransaction: boolean;
    tableSchema?: string;
};

export function qualifyTable(table: string, dbType: string, tableSchema?: string): string {
    if (tableSchema && dbType === 'postgres') {
        return `${tableSchema}.${table}`;
    }

    return table;
}

export function tableFor(runtime: AdapterRuntime, model: string): string {
    return qualifyTable(runtime.context.getModelName(model), runtime.dbType, runtime.tableSchema);
}
