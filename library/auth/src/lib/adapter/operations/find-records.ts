import type { FindManyArgs, FindOneArgs } from '../core/adapter-handles';
import type { AdapterRuntime } from '../core/adapter.context';
import { tableFor } from '../core/adapter.context';
import { buildJoinSelects, processJoinedResults } from '../query/join-utils';
import { applyJoins, buildSelectColumns, parseCountResult, PRIMARY_ALIAS } from '../query/query-builder.utils';
import { applyWhereClause } from '../query/where-clause';

export async function findOneRecord<T>(runtime: AdapterRuntime, { model, where, select, join }: FindOneArgs): Promise<T | null> {
    const { selects: joinSelects, meta } = buildJoinSelects(join, runtime.context.schema, runtime.context.getDefaultModelName);

    const qb = runtime.manager
        .createQueryBuilder()
        .select(buildSelectColumns(PRIMARY_ALIAS, model, select, runtime.context))
        .from(tableFor(runtime.context, model), PRIMARY_ALIAS);

    applyWhereClause(qb, PRIMARY_ALIAS, model, where, runtime.context.getFieldName, runtime.dbType, 'findOne');
    applyJoins(qb, PRIMARY_ALIAS, join, runtime.context, joinSelects);

    const rows = await qb.getRawMany();

    if (!rows.length) {
        return null;
    }

    if (join) {
        return (processJoinedResults(rows, join, meta, runtime.context.getModelName, runtime.context.getFieldName)[0] as T | undefined) ?? null;
    }

    return (rows[0] as T | undefined) ?? null;
}

export async function findManyRecords<T>(runtime: AdapterRuntime, args: FindManyArgs): Promise<T[]> {
    const { model, where, limit, select, offset, sortBy, join } = args;
    const { selects: joinSelects, meta } = buildJoinSelects(join, runtime.context.schema, runtime.context.getDefaultModelName);

    const qb = runtime.manager
        .createQueryBuilder()
        .select(buildSelectColumns(PRIMARY_ALIAS, model, select, runtime.context))
        .from(tableFor(runtime.context, model), PRIMARY_ALIAS);

    applyWhereClause(qb, PRIMARY_ALIAS, model, where, runtime.context.getFieldName, runtime.dbType, 'findMany');

    if (sortBy?.field) {
        qb.orderBy(`${PRIMARY_ALIAS}.${runtime.context.getFieldName({ model, field: sortBy.field })}`, sortBy.direction.toUpperCase() as 'ASC' | 'DESC');
    }

    if (offset !== undefined) {
        qb.offset(offset);
    }

    qb.limit(limit ?? 100);
    applyJoins(qb, PRIMARY_ALIAS, join, runtime.context, joinSelects);

    const rows = await qb.getRawMany();

    if (join) {
        return processJoinedResults(rows, join, meta, runtime.context.getModelName, runtime.context.getFieldName) as T[];
    }

    return rows as T[];
}

export async function countRecords(runtime: AdapterRuntime, { model, where }: { model: string; where?: FindManyArgs['where'] }): Promise<number> {
    const qb = runtime.manager.createQueryBuilder().select(`COUNT(${PRIMARY_ALIAS}.id)`, 'count').from(tableFor(runtime.context, model), PRIMARY_ALIAS);

    applyWhereClause(qb, PRIMARY_ALIAS, model, where, runtime.context.getFieldName, runtime.dbType, 'count');
    const result = await qb.getRawOne<{ count: string | number | bigint }>();

    return parseCountResult(result);
}
