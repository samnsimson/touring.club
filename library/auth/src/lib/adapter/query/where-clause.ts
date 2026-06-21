import { Brackets, ObjectLiteral, WhereExpressionBuilder } from 'typeorm';
import type { Where } from 'better-auth/adapters';

type FieldNameResolver = (args: { model: string; field: string }) => string;

export function getDatabaseType(type: string | undefined): string {
    return type ?? 'postgres';
}

export function supportsReturning(dbType: string): boolean {
    return dbType === 'postgres';
}

function buildConditionSql(
    alias: string,
    model: string,
    condition: Where,
    getFieldName: FieldNameResolver,
    dbType: string,
    paramPrefix: string,
): { sql: string; params: ObjectLiteral } {
    const column = `${alias}.${getFieldName({ model, field: condition.field })}`;
    const paramName = `${paramPrefix}_${condition.field}_${Math.random().toString(36).slice(2, 8)}`;
    const operator = condition.operator ?? 'eq';
    const value = condition.value;
    const isInsensitive =
        condition.mode === 'insensitive' && (typeof value === 'string' || (Array.isArray(value) && value.every((entry) => typeof entry === 'string')));

    if (operator === 'eq' || operator === 'ne') {
        if (value === null) {
            return {
                sql: operator === 'ne' ? `${column} IS NOT NULL` : `${column} IS NULL`,
                params: {},
            };
        }

        if (isInsensitive && typeof value === 'string') {
            if (dbType === 'postgres') {
                const op = operator === 'ne' ? 'NOT ILIKE' : 'ILIKE';
                return { sql: `${column} ${op} :${paramName}`, params: { [paramName]: value } };
            }

            const op = operator === 'ne' ? '<>' : '=';
            return {
                sql: `LOWER(${column}) ${op} LOWER(:${paramName})`,
                params: { [paramName]: value },
            };
        }

        const op = operator === 'ne' ? '<>' : '=';
        return { sql: `${column} ${op} :${paramName}`, params: { [paramName]: value } };
    }

    if (operator === 'in' || operator === 'not_in') {
        const values = Array.isArray(value) ? value : [value];
        const filtered = values.filter((entry) => entry != null);

        if (filtered.length === 0) {
            return operator === 'in' ? { sql: '1 = 0', params: {} } : { sql: '1 = 1', params: {} };
        }

        if (isInsensitive && filtered.every((entry) => typeof entry === 'string')) {
            const lowered = filtered.map((entry) => String(entry).toLowerCase());
            const op = operator === 'not_in' ? 'NOT IN' : 'IN';
            return {
                sql: `LOWER(${column}) ${op} (:...${paramName})`,
                params: { [paramName]: lowered },
            };
        }

        const op = operator === 'not_in' ? 'NOT IN' : 'IN';
        return { sql: `${column} ${op} (:...${paramName})`, params: { [paramName]: filtered } };
    }

    if (operator === 'contains' || operator === 'starts_with' || operator === 'ends_with') {
        const pattern = operator === 'contains' ? `%${value}%` : operator === 'starts_with' ? `${value}%` : `%${value}`;

        if (isInsensitive && typeof value === 'string' && dbType === 'postgres') {
            return { sql: `${column} ILIKE :${paramName}`, params: { [paramName]: pattern } };
        }

        if (isInsensitive && typeof value === 'string') {
            return {
                sql: `LOWER(${column}) LIKE LOWER(:${paramName})`,
                params: { [paramName]: pattern },
            };
        }

        return { sql: `${column} LIKE :${paramName}`, params: { [paramName]: pattern } };
    }

    const operatorMap = {
        gt: '>',
        gte: '>=',
        lt: '<',
        lte: '<=',
    } as const;

    if (operator in operatorMap) {
        return {
            sql: `${column} ${operatorMap[operator as keyof typeof operatorMap]} :${paramName}`,
            params: { [paramName]: value },
        };
    }

    return { sql: `${column} = :${paramName}`, params: { [paramName]: value } };
}

function applyConditions(
    qb: WhereExpressionBuilder,
    alias: string,
    model: string,
    conditions: Where[],
    getFieldName: FieldNameResolver,
    dbType: string,
    paramPrefix: string,
    combinator: 'and' | 'or',
): void {
    for (const [index, condition] of conditions.entries()) {
        const { sql, params } = buildConditionSql(alias, model, condition, getFieldName, dbType, `${paramPrefix}_${index}`);
        if (combinator === 'and') {
            qb.andWhere(sql, params);
        } else {
            qb.orWhere(sql, params);
        }
    }
}

export function applyWhereClause(
    qb: WhereExpressionBuilder,
    alias: string,
    model: string,
    where: Where[] | undefined,
    getFieldName: FieldNameResolver,
    dbType: string,
    paramPrefix = 'where',
): void {
    if (!where?.length) {
        return;
    }

    const andConditions = where.filter((condition) => condition.connector !== 'OR');
    const orConditions = where.filter((condition) => condition.connector === 'OR');

    if (andConditions.length) {
        qb.andWhere(
            new Brackets((subQuery) => {
                applyConditions(subQuery, alias, model, andConditions, getFieldName, dbType, `${paramPrefix}_and`, 'and');
            }),
        );
    }

    if (orConditions.length) {
        qb.andWhere(
            new Brackets((subQuery) => {
                applyConditions(subQuery, alias, model, orConditions, getFieldName, dbType, `${paramPrefix}_or`, 'or');
            }),
        );
    }
}

export function hasRootUniqueWhereCondition(
    model: string,
    where: Where[] | undefined,
    getFieldAttributes: (args: { model: string; field: string }) => { unique?: boolean },
    dbType: string,
): boolean {
    if (!where?.length) {
        return false;
    }

    return where.some((condition) => {
        if (condition.connector === 'OR') {
            return false;
        }

        if (condition.operator && condition.operator !== 'eq') {
            return false;
        }

        if (condition.mode === 'insensitive') {
            const isStringValue =
                typeof condition.value === 'string' || (Array.isArray(condition.value) && condition.value.every((value) => typeof value === 'string'));

            if (dbType === 'postgres' && isStringValue) {
                return false;
            }
        }

        if (condition.field === 'id') {
            return true;
        }

        return getFieldAttributes({ model, field: condition.field })?.unique === true;
    });
}
