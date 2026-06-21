import { ObjectLiteral, SelectQueryBuilder, type QueryDeepPartialEntity } from 'typeorm';
import type { JoinConfig } from 'better-auth/adapters';
import { AdapterContext, PRIMARY_ALIAS } from '../core/adapter.context';

export function buildSelectColumns(alias: string, model: string, select: string[] | undefined, context: AdapterContext): string[] {
    if (select?.length) {
        return select.map((field) => {
            const column = context.getFieldName({ model, field });
            return `${alias}.${column} AS "${column}"`;
        });
    }

    const fields = context.schema[context.getDefaultModelName(model)]?.fields ?? {};
    const fieldEntries = { ...fields, id: { fieldName: 'id' } };

    return Object.entries(fieldEntries).map(([field, fieldAttr]) => {
        const column = fieldAttr.fieldName || field;
        return `${alias}.${column} AS "${column}"`;
    });
}

export function applyJoins(
    qb: SelectQueryBuilder<ObjectLiteral>,
    alias: string,
    join: JoinConfig | undefined,
    context: AdapterContext,
    joinSelects: string[],
): void {
    if (!join) {
        return;
    }

    for (const [joinModel, joinAttr] of Object.entries(join)) {
        const [, joinModelRef = joinModel] = joinModel.includes('.') ? joinModel.split('.') : [undefined, joinModel];
        const joinTable = context.getModelName(joinModel);
        const joinAlias = `join_${joinModelRef}`;

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
        ...(set ?? {}),
        ...Object.fromEntries(
            Object.entries(increment).map(([field, delta]) => {
                const column = context.getFieldName({ model, field });
                return [column, () => `${column} + ${delta}`];
            }),
        ),
    } as QueryDeepPartialEntity<Record<string, unknown>>;
}

export { PRIMARY_ALIAS };
