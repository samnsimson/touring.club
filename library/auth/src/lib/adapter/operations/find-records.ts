import type { FindManyArgs, FindOneArgs } from '../core/adapter-handles';
import type { JoinConfig } from 'better-auth/adapters';
import type { AdapterRuntime } from '../core/adapter.context';
import { tableFor } from '../core/adapter.context';
import { buildJoinSelects, processJoinedResults } from '../query/join-utils';
import { applyJoins, buildSelectColumns, mapRowToFields, parseCountResult, PRIMARY_ALIAS, resolvePhysicalColumn } from '../query/query-builder.utils';
import { applyWhereClause } from '../query/where-clause';

function normalizeFindResult<T>(runtime: AdapterRuntime, model: string, row: Record<string, unknown>, join?: JoinConfig): T {
    if (!runtime.mapRowOutput) {
        return row as T;
    }

    const mapped = mapRowToFields(runtime.context, model, row) as Record<string, unknown>;

    if (!join) {
        return mapped as T;
    }

    for (const [joinModel] of Object.entries(join)) {
        const joinModelName = runtime.context.getModelName(joinModel);
        const joinData = row[joinModel] ?? row[joinModelName];

        if (joinData && typeof joinData === 'object' && !Array.isArray(joinData)) {
            mapped[joinModel] = mapRowToFields(runtime.context, joinModel, joinData as Record<string, unknown>);
        } else if (Array.isArray(joinData)) {
            mapped[joinModel] = joinData.map((item) => mapRowToFields(runtime.context, joinModel, item as Record<string, unknown>));
        }
    }

    return mapped as T;
}

export async function findOneRecord<T>(runtime: AdapterRuntime, { model, where, select, join }: FindOneArgs): Promise<T | null> {
    const { selects: joinSelects, meta } = buildJoinSelects(join, runtime.context.schema, runtime.context.getDefaultModelName, runtime.context.getFieldName);

    const qb = runtime.manager
        .createQueryBuilder()
        .select(buildSelectColumns(PRIMARY_ALIAS, model, select, runtime.context))
        .from(tableFor(runtime, model), PRIMARY_ALIAS);

    applyWhereClause(qb, PRIMARY_ALIAS, model, where, runtime.context.getFieldName, runtime.dbType, 'findOne');
    applyJoins(qb, PRIMARY_ALIAS, model, join, runtime.context, joinSelects, runtime.dbType, runtime.tableSchema);

    const rows = await qb.getRawMany();

    if (!rows.length) {
        return null;
    }

    if (join) {
        const row = processJoinedResults(rows, join, meta, runtime.context.getModelName, runtime.context.getFieldName)[0];
        return row ? normalizeFindResult<T>(runtime, model, row, join) : null;
    }

    return normalizeFindResult<T>(runtime, model, rows[0]);
}

export async function findManyRecords<T>(runtime: AdapterRuntime, args: FindManyArgs): Promise<T[]> {
    const { model, where, limit, select, offset, sortBy, join } = args;
    const { selects: joinSelects, meta } = buildJoinSelects(join, runtime.context.schema, runtime.context.getDefaultModelName, runtime.context.getFieldName);
    const table = tableFor(runtime, model);

    const baseQb = runtime.manager
        .createQueryBuilder()
        .select(buildSelectColumns(PRIMARY_ALIAS, model, select, runtime.context))
        .from(table, PRIMARY_ALIAS);

    applyWhereClause(baseQb, PRIMARY_ALIAS, model, where, runtime.context.getFieldName, runtime.dbType, 'findMany');

    if (sortBy?.field) {
        baseQb.orderBy(`${PRIMARY_ALIAS}.${runtime.context.getFieldName({ model, field: sortBy.field })}`, sortBy.direction.toUpperCase() as 'ASC' | 'DESC');
    }

    if (join) {
        if (offset !== undefined) {
            baseQb.offset(offset);
        }

        if (limit !== undefined) {
            baseQb.limit(limit);
        }
    } else {
        if (offset !== undefined) {
            baseQb.offset(offset);
        }

        baseQb.limit(limit ?? 100);
    }

    const qb = join
        ? runtime.manager
              .createQueryBuilder()
              .select(buildSelectColumns(PRIMARY_ALIAS, model, select, runtime.context))
              .from(`(${baseQb.getQuery()})`, PRIMARY_ALIAS)
              .setParameters(baseQb.getParameters())
        : baseQb;

    if (join && sortBy?.field) {
        const sortColumn = resolvePhysicalColumn(runtime.context, model, sortBy.field);
        qb.orderBy(`${PRIMARY_ALIAS}."${sortColumn}"`, sortBy.direction.toUpperCase() as 'ASC' | 'DESC');
    }

    applyJoins(qb, PRIMARY_ALIAS, model, join, runtime.context, joinSelects, runtime.dbType, runtime.tableSchema, Boolean(join));

    const rows = await qb.getRawMany();

    if (join) {
        return processJoinedResults(rows, join, meta, runtime.context.getModelName, runtime.context.getFieldName).map((row) =>
            normalizeFindResult<T>(runtime, model, row, join),
        );
    }

    return rows.map((row) => normalizeFindResult<T>(runtime, model, row));
}

export async function countRecords(runtime: AdapterRuntime, { model, where }: { model: string; where?: FindManyArgs['where'] }): Promise<number> {
    const idColumn = runtime.context.getFieldName({ model, field: 'id' });
    const qb = runtime.manager.createQueryBuilder().select(`COUNT(${PRIMARY_ALIAS}.${idColumn})`, 'count').from(tableFor(runtime, model), PRIMARY_ALIAS);

    applyWhereClause(qb, PRIMARY_ALIAS, model, where, runtime.context.getFieldName, runtime.dbType, 'count');
    const result = await qb.getRawOne<{ count: string | number | bigint }>();

    return parseCountResult(result);
}
