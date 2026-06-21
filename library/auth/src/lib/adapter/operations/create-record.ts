import type { AdapterRuntime } from '../core/adapter.context';
import { insertRecord } from './insert-record';

export async function createRecord<T extends Record<string, unknown>>(runtime: AdapterRuntime, { data, model }: { data: T; model: string }): Promise<T> {
    if (runtime.inTransaction) {
        return (await insertRecord(runtime.manager, runtime.dbType, runtime.context, model, data)) as T;
    }

    return (await runtime.manager.transaction(async (trx) => insertRecord(trx, runtime.dbType, runtime.context, model, data))) as T;
}
