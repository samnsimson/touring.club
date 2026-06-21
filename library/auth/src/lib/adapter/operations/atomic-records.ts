import type { Where } from 'better-auth/adapters';
import type { AdapterMethodHandles, FindOneArgs } from '../core/adapter-handles';
import type { AdapterRuntime } from '../core/adapter.context';
import { tableFor } from '../core/adapter.context';
import { buildIncrementSetClause, buildSelectColumns, PRIMARY_ALIAS, shouldUsePessimisticLock } from '../query/query-builder.utils';
import { applyWhereClause, supportsReturning } from '../query/where-clause';

export async function consumeOneRecord<T>(runtime: AdapterRuntime, { model, where }: { model: string; where: Where[] }): Promise<T | null> {
    const consume = async (manager: AdapterRuntime['manager']): Promise<T | null> => {
        const selectQb = manager
            .createQueryBuilder()
            .select(buildSelectColumns(PRIMARY_ALIAS, model, undefined, runtime.context))
            .from(tableFor(runtime.context, model), PRIMARY_ALIAS);

        applyWhereClause(selectQb, PRIMARY_ALIAS, model, where, runtime.context.getFieldName, runtime.dbType, 'consume');

        if (shouldUsePessimisticLock(runtime.dbType)) {
            selectQb.setLock('pessimistic_write');
        }

        const row = await selectQb.limit(1).getRawOne();
        if (!row) {
            return null;
        }

        const idField = runtime.context.getFieldName({ model, field: 'id' });
        const targetId = row[idField] ?? row.id;

        if (targetId === undefined || targetId === null) {
            return null;
        }

        const table = tableFor(runtime.context, model);
        const deleteQb = manager.createQueryBuilder().delete().from(table).where(`${table}.${idField} = :id`, { id: targetId });

        if (supportsReturning(runtime.dbType)) {
            const result = await deleteQb.returning('*').execute();
            return (result.raw[0] as T | undefined) ?? null;
        }

        const result = await deleteQb.execute();
        return result.affected ? (row as T) : null;
    };

    if (runtime.inTransaction) {
        return consume(runtime.manager);
    }

    return runtime.manager.transaction(consume);
}

export async function incrementOneRecord<T>(
    runtime: AdapterRuntime,
    handles: AdapterMethodHandles,
    {
        model,
        where,
        increment,
        set,
    }: {
        model: string;
        where: Where[];
        increment: Record<string, number>;
        set?: Record<string, unknown>;
    },
): Promise<T | null> {
    const table = tableFor(runtime.context, model);

    const mutate = async (manager: AdapterRuntime['manager']): Promise<T | null> => {
        const selectQb = manager
            .createQueryBuilder()
            .select(`${PRIMARY_ALIAS}.${runtime.context.getFieldName({ model, field: 'id' })}`, 'id')
            .from(table, PRIMARY_ALIAS);

        applyWhereClause(selectQb, PRIMARY_ALIAS, model, where, runtime.context.getFieldName, runtime.dbType, 'increment');

        if (shouldUsePessimisticLock(runtime.dbType)) {
            selectQb.setLock('pessimistic_write');
        }

        const target = await selectQb.limit(1).getRawOne<{ id: string | number }>();
        if (!target?.id) {
            return null;
        }

        const idField = runtime.context.getFieldName({ model, field: 'id' });
        const setClause = buildIncrementSetClause(runtime.context, model, increment, set);
        const updateQb = manager.createQueryBuilder().update(table).set(setClause).where(`${table}.${idField} = :id`, {
            id: target.id,
        });

        if (supportsReturning(runtime.dbType)) {
            const result = await updateQb.returning('*').execute();
            return (result.raw[0] as T | undefined) ?? null;
        }

        const result = await updateQb.execute();
        if (!result.affected) {
            return null;
        }

        const findArgs: FindOneArgs = {
            model,
            where: [
                ...where,
                {
                    field: 'id',
                    value: target.id,
                    operator: 'eq',
                    connector: 'AND',
                },
            ],
        };

        return handles.findOne<T>(findArgs);
    };

    if (runtime.inTransaction) {
        return mutate(runtime.manager);
    }

    return runtime.manager.transaction(mutate);
}
