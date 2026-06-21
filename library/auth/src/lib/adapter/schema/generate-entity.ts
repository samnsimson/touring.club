import type { NamingStrategyInterface } from 'typeorm';
import type { DBFieldAttribute } from 'better-auth/db';
import { mapFieldToTypeormColumn } from './column-type';
import { resolveColumnName, resolveTableName } from './naming';
import { toEntityClassName } from './schema-paths';

type TableDefinition = {
    modelName: string;
    fields: Record<string, DBFieldAttribute>;
};

export function generateEntitySource(
    modelKey: string,
    table: TableDefinition,
    dbType: string,
    options: {
        schema?: string;
        namingStrategy?: NamingStrategyInterface;
    } = {},
): string {
    const { schema = 'auth', namingStrategy } = options;
    const className = toEntityClassName(modelKey);
    const tableName = resolveTableName(namingStrategy, modelKey, table.modelName);
    const entityOptions = schema ? `, { schema: '${schema}' }` : '';
    const lines = [
        `import { Column, Entity, PrimaryColumn } from 'typeorm';`,
        '',
        `@Entity('${tableName}'${entityOptions})`,
        `export class ${className} {`,
        `  @PrimaryColumn('text')`,
        `  id!: string;`,
        '',
    ];

    for (const [fieldKey, field] of Object.entries(table.fields)) {
        if (fieldKey === 'id') continue;

        const columnName = resolveColumnName(namingStrategy, fieldKey, field.fieldName);
        const { columnType, tsType } = mapFieldToTypeormColumn(field, dbType);
        const columnOptions: string[] = [];

        if (columnName !== fieldKey) {
            columnOptions.push(`name: '${columnName}'`);
        }

        if (field.required === false) {
            columnOptions.push('nullable: true');
        } else {
            columnOptions.push('nullable: false');
        }

        if (field.unique || columnName === 'email' || columnName === 'token') {
            columnOptions.push('unique: true');
        }

        const decoratorArgs = columnOptions.length > 0 ? `, { ${columnOptions.join(', ')} }` : '';
        lines.push(`  @Column('${columnType}'${decoratorArgs})`);
        lines.push(`  ${fieldKey}!: ${tsType};`);
        lines.push('');
    }

    lines.push('}');
    lines.push('');

    return lines.join('\n');
}
