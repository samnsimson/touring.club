import { DefaultNamingStrategy, type NamingStrategyInterface } from 'typeorm';

function snakeCase(value: string): string {
    value = value.replaceAll(/([A-Z])([A-Z])([a-z])/g, '$1_$2$3');
    value = value.replaceAll(/([a-z0-9])([A-Z])/g, '$1_$2');
    value = value.toLowerCase();
    return value;
}

export class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
    override tableName(className: string, customName?: string): string {
        return customName ?? snakeCase(className);
    }

    override columnName(propertyName: string, customName: string | undefined, embeddedPrefixes: string[]): string {
        const prefix = snakeCase(embeddedPrefixes.concat('').join('_'));
        return prefix + (customName ?? snakeCase(propertyName));
    }

    override relationName(propertyName: string): string {
        return snakeCase(propertyName);
    }

    override joinColumnName(relationName: string, referencedColumnName: string): string {
        return snakeCase(`${relationName}_${referencedColumnName}`);
    }

    override joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string, secondPropertyName: string): string {
        void secondPropertyName;
        return snakeCase(`${firstTableName}_${firstPropertyName.replace(/\./g, '_')}_${secondTableName}`);
    }

    override joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
        return snakeCase(`${tableName}_${columnName ?? propertyName}`);
    }

    classTableInheritanceParentColumnName(parentTableName: string, parentTableIdPropertyName: string): string {
        return snakeCase(`${parentTableName}_${parentTableIdPropertyName}`);
    }

    eagerJoinRelationAlias(alias: string, propertyPath: string): string {
        return `${alias}_${propertyPath.replace('.', '_')}`;
    }
}

export function usernameValidator(username: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(username);
}
