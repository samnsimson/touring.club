import { ObjectLiteral, SelectQueryBuilder, type QueryDeepPartialEntity } from 'typeorm';
import type { JoinConfig } from 'better-auth/adapters';
import { AdapterContext, PRIMARY_ALIAS, qualifyTable } from '../core/adapter.context';

export function getModelFields(context: AdapterContext, model: string): string[] {
    const fields = context.schema[context.getDefaultModelName(model)]?.fields ?? {};
    return [...Object.keys(fields), 'id'];
}

export function mapFieldsToColumns(context: AdapterContext, model: string, data: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(data)
            .filter(([, value]) => value !== undefined)
            .map(([field, value]) => [context.getFieldName({ model, field }), value]),
    );
}

export function mapRowToFields(context: AdapterContext, model: string, row: Record<string, unknown>): Record<string, unknown> {
    const mapped: Record<string, unknown> = {};

    for (const field of getModelFields(context, model)) {
        const column = context.getFieldName({ model, field });

        if (field in row) {
            mapped[field] = row[field];
            continue;
        }

        if (column in row) {
            mapped[field] = row[column];
        }
    }

    return mapped;
}

export function resolvePhysicalColumn(context: AdapterContext, model: string, field: string): string {
    return context.getFieldName({ model, field });
}

export function buildSelectColumns(alias: string, model: string, select: string[] | undefined, context: AdapterContext): string[] {
    if (select?.length) {
        return select.map((field) => {
            const column = resolvePhysicalColumn(context, model, field);
            return `${alias}.${column} AS "${column}"`;
        });
    }

    const fields = context.schema[context.getDefaultModelName(model)]?.fields ?? {};
    const fieldEntries = { ...fields, id: { fieldName: 'id' } };

    return Object.keys(fieldEntries).map((field) => {
        const column = resolvePhysicalColumn(context, model, field);
        return `${alias}.${column} AS "${column}"`;
    });
}

export function applyJoins(
    qb: SelectQueryBuilder<ObjectLiteral>,
    alias: string,
    model: string,
    join: JoinConfig | undefined,
    context: AdapterContext,
    joinSelects: string[],
    dbType: string,
    tableSchema?: string,
    fromSubquery = false,
): void {
    if (!join) {
        return;
    }

    for (const [joinModel, joinAttr] of Object.entries(join)) {
        const [, joinModelRef = joinModel] = joinModel.includes('.') ? joinModel.split('.') : [undefined, joinModel];
        const joinTable = qualifyTable(context.getModelName(joinModel), dbType, tableSchema);
        const joinAlias = `join_${joinModelRef}`;

        if (fromSubquery) {
            const fromColumn = resolvePhysicalColumn(context, model, joinAttr.on.from);
            const toColumn = resolvePhysicalColumn(context, joinModel, joinAttr.on.to);
            qb.leftJoin(joinTable, joinAlias, `${joinAlias}.${toColumn} = ${alias}."${fromColumn}"`);
            continue;
        }

        qb.leftJoin(joinTable, joinAlias, `${joinAlias}.${joinAttr.on.to} = ${alias}.${joinAttr.on.from}`);
    }

    if (joinSelects.length) {
        qb.addSelect(joinSelects);
    }
}

export function parseCountResult(result: { count: string | number | bigint } | undefined): number {
    if (!result) {
        return 0;
    }

    if (typeof result.count === 'number') {
        return result.count;
    }

    if (typeof result.count === 'bigint') {
        return Number(result.count);
    }

    return parseInt(String(result.count), 10);
}

export function shouldUsePessimisticLock(dbType: string): boolean {
    return dbType === 'postgres' || dbType === 'mysql' || dbType === 'mariadb';
}

export function buildIncrementSetClause(
    context: AdapterContext,
    model: string,
    increment: Record<string, number>,
    set?: Record<string, unknown>,
): QueryDeepPartialEntity<Record<string, unknown>> {
    return {
        ...mapFieldsToColumns(context, model, set ?? {}),
        ...Object.fromEntries(
            Object.entries(increment).map(([field, delta]) => {
                const column = context.getFieldName({ model, field });
                return [column, () => `${column} + ${delta}`];
            }),
        ),
    } as QueryDeepPartialEntity<Record<string, unknown>>;
}

export { PRIMARY_ALIAS };
