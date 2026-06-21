import { AdapterConfig } from '../adapter.config';
import type { AdapterContext, AdapterRuntime } from './adapter.context';
import { consumeOneRecord, incrementOneRecord } from '../operations/atomic-records';
import { createRecord } from '../operations/create-record';
import { countRecords, findManyRecords, findOneRecord } from '../operations/find-records';
import { deleteManyRecords, deleteRecord, updateManyRecords, updateRecord } from '../operations/mutate-records';

export function createTypeormAdapterMethods(
    manager: AdapterRuntime['manager'],
    dbType: string,
    context: AdapterContext,
    inTransaction = false,
    config: AdapterConfig = {},
) {
    const runtime: AdapterRuntime = { manager, dbType, context, inTransaction, tableSchema: config.schema ?? 'auth' };

    const methods = {
        create: <T extends Record<string, unknown>>(args: { data: T; model: string }) => createRecord(runtime, args),
        findOne: <T>(args: Parameters<typeof findOneRecord<T>>[1]) => findOneRecord<T>(runtime, args),
        findMany: <T>(args: Parameters<typeof findManyRecords<T>>[1]) => findManyRecords<T>(runtime, args),
        count: (args: Parameters<typeof countRecords>[1]) => countRecords(runtime, args),
        update: <T>(args: { model: string; where: Parameters<typeof updateRecord>[2]['where']; update: T }) => updateRecord(runtime, methods, args),
        updateMany: (args: Parameters<typeof updateManyRecords>[1]) => updateManyRecords(runtime, args),
        delete: (args: Parameters<typeof deleteRecord>[1]) => deleteRecord(runtime, args),
        deleteMany: (args: Parameters<typeof deleteManyRecords>[1]) => deleteManyRecords(runtime, args),
        consumeOne: <T>(args: Parameters<typeof consumeOneRecord<T>>[1]) => consumeOneRecord<T>(runtime, args),
        incrementOne: <T>(args: Parameters<typeof incrementOneRecord<T>>[2]) => incrementOneRecord<T>(runtime, methods, args),
        options: config,
    };

    return methods;
}
