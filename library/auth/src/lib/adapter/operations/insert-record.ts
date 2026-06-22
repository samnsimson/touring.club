import { BetterAuthError } from 'better-auth';
import type { Where } from 'better-auth/adapters';
import { ObjectLiteral, type QueryDeepPartialEntity } from 'typeorm';
import { AdapterRuntime, PRIMARY_ALIAS, tableFor } from '../core/adapter.context';
import { buildSelectColumns, mapFieldsToColumns, mapRowToFields } from '../query/query-builder.utils';
import { applyWhereClause, supportsReturning } from '../query/where-clause';

export async function insertRecord(
    runtime: AdapterRuntime,
    model: string,
    data: Record<string, unknown>,
    where: Where[] = [],
): Promise<Record<string, unknown>> {
    const table = tableFor(runtime, model);
    const columnData = mapFieldsToColumns(runtime.context, model, data);
    let insertQb = runtime.manager
        .createQueryBuilder()
        .insert()
        .into(table)
        .values(columnData as QueryDeepPartialEntity<ObjectLiteral>);

    if (supportsReturning(runtime.dbType)) insertQb = insertQb.returning('*');

    const insertResult = await insertQb.execute();
    if (supportsReturning(runtime.dbType) && insertResult.raw[0]) {
        return mapRowToFields(runtime.context, model, insertResult.raw[0] as Record<string, unknown>);
    }

    const rowByWhere = await findInsertedRowByWhere(runtime, model, table, where);
    if (rowByWhere) return rowByWhere;

    const rowById = await findInsertedRowById(runtime, model, table, data.id);
    if (rowById) return rowById;

    const rowByValues = await findInsertedRowByValues(runtime, model, table, data);
    if (rowByValues) return rowByValues;

    throw new BetterAuthError(`Failed to retrieve inserted row for model "${model}".`);
}

async function findInsertedRowByWhere(runtime: AdapterRuntime, model: string, table: string, where: Where[]): Promise<Record<string, unknown> | undefined> {
    if (!where.length) return undefined;

    const qb = runtime.manager
        .createQueryBuilder()
        .select(buildSelectColumns(PRIMARY_ALIAS, model, undefined, runtime.context))
        .from(table, PRIMARY_ALIAS)
        .limit(1);

    applyWhereClause(qb, PRIMARY_ALIAS, model, where, runtime.context.getFieldName, runtime.dbType, 'insert');
    return (await qb.getRawOne()) ?? undefined;
}

async function findInsertedRowById(runtime: AdapterRuntime, model: string, table: string, id: unknown): Promise<Record<string, unknown> | undefined> {
    if (!id) return undefined;

    return (
        (await runtime.manager
            .createQueryBuilder()
            .select(buildSelectColumns(PRIMARY_ALIAS, model, undefined, runtime.context))
            .from(table, PRIMARY_ALIAS)
            .where(`${PRIMARY_ALIAS}.id = :id`, { id })
            .limit(1)
            .getRawOne()) ?? undefined
    );
}

async function findInsertedRowByValues(
    runtime: AdapterRuntime,
    model: string,
    table: string,
    data: Record<string, unknown>,
): Promise<Record<string, unknown> | undefined> {
    let qb = runtime.manager
        .createQueryBuilder()
        .select(buildSelectColumns(PRIMARY_ALIAS, model, undefined, runtime.context))
        .from(table, PRIMARY_ALIAS)
        .limit(1);

    for (const [field, value] of Object.entries(data)) {
        if (value === undefined) continue;
        const column = runtime.context.getFieldName({ model, field });
        qb = qb.andWhere(`${PRIMARY_ALIAS}.${column} ${value === null ? 'IS NULL' : '= :value_' + field}`, {
            [`value_${field}`]: value,
        });
    }

    const rows = await qb.limit(2).getRawMany();
    return rows.length === 1 ? rows[0] : undefined;
}
