import type { NamingStrategyInterface } from 'typeorm';
import type { AdapterContext } from './adapter.context';
import { resolveColumnName, resolveTableName } from '../schema/naming';

export function createNamingAwareContext(context: AdapterContext, namingStrategy?: NamingStrategyInterface): AdapterContext {
    if (!namingStrategy) return context;
    return {
        ...context,
        getModelName: (model: string) => resolveTableName(namingStrategy, context.getDefaultModelName(model), context.getModelName(model)),
        getFieldName: (args) => {
            const customName = context.getFieldAttributes(args)?.fieldName;
            return resolveColumnName(namingStrategy, args.field, customName);
        },
    };
}
