import type { DBFieldAttribute } from 'better-auth/db';

export type TypeormColumnType = {
    columnType: string;
    tsType: string;
    length?: string;
};

function resolveFieldType(field: DBFieldAttribute): string {
    return typeof field.type === 'string' ? field.type : 'string';
}

export function mapFieldToTypeormColumn(field: DBFieldAttribute, dbType: string): TypeormColumnType {
    const fieldType = resolveFieldType(field);

    switch (fieldType) {
        case 'boolean':
            return { columnType: dbType === 'sqlite' ? 'boolean' : 'boolean', tsType: 'boolean' };
        case 'number':
            return field.bigint ? { columnType: 'bigint', tsType: 'string' } : { columnType: 'integer', tsType: 'number' };
        case 'date':
            return {
                columnType: dbType === 'postgres' ? 'timestamp' : dbType === 'sqlite' ? 'datetime' : 'timestamp',
                tsType: 'Date',
            };
        case 'json':
            return {
                columnType: dbType === 'postgres' ? 'jsonb' : 'text',
                tsType: 'Record<string, unknown>',
            };
        case 'number[]':
        case 'string[]':
            return {
                columnType: dbType === 'postgres' ? 'jsonb' : 'text',
                tsType: fieldType === 'number[]' ? 'number[]' : 'string[]',
            };
        default:
            return { columnType: 'text', tsType: 'string' };
    }
}
