import { BetterAuthError } from 'better-auth';
import type { Where } from 'better-auth/adapters';
import type { EntityManager } from 'typeorm';
import { ObjectLiteral, type QueryDeepPartialEntity } from 'typeorm';
import { AdapterContext, PRIMARY_ALIAS, tableFor } from '../core/adapter.context';
import { buildSelectColumns } from '../query/query-builder.utils';
import { applyWhereClause, supportsReturning } from '../query/where-clause';

export async function insertRecord(
    manager: EntityManager,
    dbType: string,
    context: AdapterContext,
    model: string,
    data: Record<string, unknown>,
    where: Where[] = [],
): Promise<Record<string, unknown>> {
    const table = tableFor(context, model);
    let insertQb = manager
        .createQueryBuilder()
        .insert()
        .into(table)
        .values(data as QueryDeepPartialEntity<ObjectLiteral>);

    if (supportsReturning(dbType)) insertQb = insertQb.returning('*');

    const insertResult = await insertQb.execute();
    if (supportsReturning(dbType) && insertResult.raw[0]) return insertResult.raw[0];

    const rowByWhere = await findInsertedRowByWhere(manager, dbType, context, model, table, where);
    if (rowByWhere) return rowByWhere;

    const rowById = await findInsertedRowById(manager, context, model, table, data.id);
    if (rowById) return rowById;

    const rowByValues = await findInsertedRowByValues(manager, context, model, table, data);
    if (rowByValues) return rowByValues;

    throw new BetterAuthError(`Failed to retrieve inserted row for model "${model}".`);
}

async function findInsertedRowByWhere(
    manager: EntityManager,
    dbType: string,
    context: AdapterContext,
    model: string,
    table: string,
    where: Where[],
): Promise<Record<string, unknown> | undefined> {
    if (!where.length) return undefined;

    const qb = manager
        .createQueryBuilder()
        .select(buildSelectColumns(PRIMARY_ALIAS, model, undefined, context))
        .from(table, PRIMARY_ALIAS)
        .limit(1);

    applyWhereClause(qb, PRIMARY_ALIAS, model, where, context.getFieldName, dbType, 'insert');
    return (await qb.getRawOne()) ?? undefined;
}

async function findInsertedRowById(
    manager: EntityManager,
    context: AdapterContext,
    model: string,
    table: string,
    id: unknown,
): Promise<Record<string, unknown> | undefined> {
    if (!id) return undefined;

    return (
        (await manager
            .createQueryBuilder()
            .select(buildSelectColumns(PRIMARY_ALIAS, model, undefined, context))
            .from(table, PRIMARY_ALIAS)
            .where(`${PRIMARY_ALIAS}.id = :id`, { id })
            .limit(1)
            .getRawOne()) ?? undefined
    );
}

async function findInsertedRowByValues(
    manager: EntityManager,
    context: AdapterContext,
    model: string,
    table: string,
    data: Record<string, unknown>,
): Promise<Record<string, unknown> | undefined> {
    let qb = manager
        .createQueryBuilder()
        .select(buildSelectColumns(PRIMARY_ALIAS, model, undefined, context))
        .from(table, PRIMARY_ALIAS)
        .limit(1);

    for (const [key, value] of Object.entries(data)) {
        if (value === undefined) continue;
        qb = qb.andWhere(`${PRIMARY_ALIAS}.${key} ${value === null ? 'IS NULL' : '= :value_' + key}`, {
            [`value_${key}`]: value,
        });
    }

    const rows = await qb.limit(2).getRawMany();
    return rows.length === 1 ? rows[0] : undefined;
}
