import type { EntityManager } from 'typeorm';

export const PRIMARY_ALIAS = 'base';

export type AdapterContext = {
    getFieldName: (args: { model: string; field: string }) => string;
    getModelName: (model: string) => string;
    getDefaultModelName: (model: string) => string;
    getFieldAttributes: (args: { model: string; field: string }) => { unique?: boolean };
    schema: Record<string, { fields?: Record<string, { fieldName?: string }> }>;
};

export type AdapterRuntime = {
    manager: EntityManager;
    dbType: string;
    context: AdapterContext;
    inTransaction: boolean;
};

export function tableFor(context: AdapterContext, model: string): string {
    return context.getModelName(model);
}
