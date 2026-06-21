import type { Where } from 'better-auth/adapters';
import { ObjectLiteral, type QueryDeepPartialEntity } from 'typeorm';
import type { AdapterMethodHandles } from '../core/adapter-handles';
import type { AdapterRuntime } from '../core/adapter.context';
import { tableFor } from '../core/adapter.context';
import { applyWhereClause, buildPostUpdateWhere, hasRootUniqueWhereCondition, supportsReturning } from '../query/where-clause';

export async function updateRecord<T>(
    runtime: AdapterRuntime,
    handles: AdapterMethodHandles,
    { model, where, update }: { model: string; where: Where[]; update: T },
): Promise<T | null> {
    const table = tableFor(runtime, model);

    if (!hasRootUniqueWhereCondition(model, where, runtime.context.getFieldAttributes, runtime.dbType)) {
        const affected = await handles.updateMany({
            model,
            where,
            update: update as Record<string, unknown>,
        });

        if (!affected) {
            return null;
        }

        return handles.findOne<T>({ model, where });
    }

    const qb = runtime.manager
        .createQueryBuilder()
        .update(table)
        .set(update as QueryDeepPartialEntity<ObjectLiteral>);
    applyWhereClause(qb, table, model, where, runtime.context.getFieldName, runtime.dbType, 'update');

    if (supportsReturning(runtime.dbType)) {
        const result = await qb.returning('*').execute();
        return (result.raw[0] as T | undefined) ?? null;
    }

    const result = await qb.execute();
    if (!result.affected) {
        return null;
    }

    return handles.findOne<T>({ model, where: buildPostUpdateWhere(where, update as Record<string, unknown>) });
}

export async function updateManyRecords(
    runtime: AdapterRuntime,
    { model, where, update }: { model: string; where: Where[]; update: Record<string, unknown> },
): Promise<number> {
    const table = tableFor(runtime, model);
    const qb = runtime.manager.createQueryBuilder().update(table).set(update);
    applyWhereClause(qb, table, model, where, runtime.context.getFieldName, runtime.dbType, 'updateMany');

    const result = await qb.execute();
    return result.affected ?? 0;
}

export async function deleteRecord(runtime: AdapterRuntime, { model, where }: { model: string; where: Where[] }): Promise<void> {
    const table = tableFor(runtime, model);
    const qb = runtime.manager.createQueryBuilder().delete().from(table);
    applyWhereClause(qb, table, model, where, runtime.context.getFieldName, runtime.dbType, 'delete');

    await qb.execute();
}

export async function deleteManyRecords(runtime: AdapterRuntime, { model, where }: { model: string; where: Where[] }): Promise<number> {
    const table = tableFor(runtime, model);
    const qb = runtime.manager.createQueryBuilder().delete().from(table);
    applyWhereClause(qb, table, model, where, runtime.context.getFieldName, runtime.dbType, 'deleteMany');

    const result = await qb.execute();
    return result.affected ?? 0;
}
