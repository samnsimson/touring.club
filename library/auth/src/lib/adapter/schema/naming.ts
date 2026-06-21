import type { NamingStrategyInterface } from 'typeorm';
import { toEntityClassName } from './schema-paths';

export function resolveTableName(namingStrategy: NamingStrategyInterface | undefined, modelKey: string, modelName: string): string {
    if (!namingStrategy) {
        return modelName;
    }

    return namingStrategy.tableName(toEntityClassName(modelKey), modelName);
}

export function resolveColumnName(namingStrategy: NamingStrategyInterface | undefined, propertyName: string, customName?: string): string {
    const explicitName = customName !== propertyName ? customName : undefined;

    if (!namingStrategy) {
        return explicitName ?? propertyName;
    }

    return namingStrategy.columnName(propertyName, explicitName, []);
}
