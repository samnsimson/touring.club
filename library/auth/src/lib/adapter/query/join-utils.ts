import type { JoinConfig } from 'better-auth/adapters';

type FieldNameResolver = (args: { model: string; field: string }) => string;
type ModelNameResolver = (model: string) => string;

export type JoinSelectMeta = {
    joinModel: string;
    joinModelRef: string;
    field: string;
    fieldName: string;
};

export function buildJoinSelects(
    join: JoinConfig | undefined,
    schema: Record<string, { fields?: Record<string, { fieldName?: string }> }>,
    getDefaultModelName: ModelNameResolver,
    getFieldName: FieldNameResolver,
): { selects: string[]; meta: JoinSelectMeta[] } {
    const selects: string[] = [];
    const meta: JoinSelectMeta[] = [];

    if (!join) {
        return { selects, meta };
    }

    for (const [joinModel] of Object.entries(join)) {
        const fields = schema[getDefaultModelName(joinModel)]?.fields;
        const [, joinModelRef = joinModel] = joinModel.includes('.') ? joinModel.split('.') : [undefined, joinModel];

        if (!fields) {
            continue;
        }

        const fieldEntries = { ...fields, id: { fieldName: 'id' } };

        for (const field of Object.keys(fieldEntries)) {
            const column = getFieldName({ model: joinModel, field });
            selects.push(`join_${joinModelRef}.${column} AS _joined_${joinModelRef}_${column}`);
            meta.push({ joinModel, joinModelRef, field, fieldName: column });
        }
    }

    return { selects, meta };
}

export function processJoinedResults(
    rows: Record<string, unknown>[],
    join: JoinConfig | undefined,
    meta: JoinSelectMeta[],
    getModelName: ModelNameResolver,
    getFieldName: FieldNameResolver,
): Record<string, unknown>[] {
    if (!join || !rows.length) {
        return rows;
    }

    const groupedByMainId = new Map<string, Record<string, unknown>>();

    for (const currentRow of rows) {
        const mainModelFields: Record<string, unknown> = {};
        const joinedModelFields: Record<string, Record<string, unknown>> = {};

        for (const [joinModel] of Object.entries(join)) {
            joinedModelFields[getModelName(joinModel)] = {};
        }

        for (const [key, value] of Object.entries(currentRow)) {
            const keyStr = String(key);
            let assigned = false;

            for (const { joinModel, field, fieldName, joinModelRef } of meta) {
                if (keyStr === `_joined_${joinModelRef}_${fieldName}`) {
                    joinedModelFields[getModelName(joinModel)][field] = value;
                    assigned = true;
                    break;
                }
            }

            if (!assigned) {
                mainModelFields[keyStr] = value;
            }
        }

        const mainId = mainModelFields.id;
        if (!mainId) {
            continue;
        }

        if (!groupedByMainId.has(String(mainId))) {
            const entry: Record<string, unknown> = { ...mainModelFields };

            for (const [joinModel, joinAttr] of Object.entries(join)) {
                entry[getModelName(joinModel)] = joinAttr.relation === 'one-to-one' ? null : [];
            }

            groupedByMainId.set(String(mainId), entry);
        }

        const entry = groupedByMainId.get(String(mainId));
        if (!entry) {
            continue;
        }

        for (const [joinModel, joinAttr] of Object.entries(join)) {
            const joinModelName = getModelName(joinModel);
            const joinedObj = joinedModelFields[joinModelName];
            const hasData = joinedObj && Object.keys(joinedObj).length > 0 && Object.values(joinedObj).some((value) => value !== null && value !== undefined);

            if (joinAttr.relation === 'one-to-one') {
                entry[joinModelName] = hasData ? joinedObj : null;
                continue;
            }

            if (!Array.isArray(entry[joinModelName]) || !hasData) {
                continue;
            }

            const limit = joinAttr.limit ?? 100;
            if (entry[joinModelName].length >= limit) {
                continue;
            }

            const idFieldName = getFieldName({ model: joinModel, field: 'id' });
            const joinedId = joinedObj[idFieldName];

            if (joinedId) {
                const exists = entry[joinModelName].some((item) => (item as Record<string, unknown>)[idFieldName] === joinedId);

                if (!exists && entry[joinModelName].length < limit) {
                    entry[joinModelName].push(joinedObj);
                }
            } else if (entry[joinModelName].length < limit) {
                entry[joinModelName].push(joinedObj);
            }
        }
    }

    const result = Array.from(groupedByMainId.values());

    for (const entry of result) {
        for (const [joinModel, joinAttr] of Object.entries(join)) {
            if (joinAttr.relation === 'one-to-one') {
                continue;
            }

            const joinModelName = getModelName(joinModel);
            if (Array.isArray(entry[joinModelName])) {
                const limit = joinAttr.limit ?? 100;
                if (entry[joinModelName].length > limit) {
                    entry[joinModelName] = entry[joinModelName].slice(0, limit);
                }
            }
        }
    }

    return result;
}
