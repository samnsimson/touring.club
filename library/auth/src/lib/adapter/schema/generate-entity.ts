import type { DBFieldAttribute } from 'better-auth/db';
import { mapFieldToTypeormColumn } from './column-type';
import { toEntityClassName } from './schema-paths';

type TableDefinition = {
    modelName: string;
    fields: Record<string, DBFieldAttribute>;
};

export function generateEntitySource(
    modelKey: string,
    table: TableDefinition,
    dbType: string,
    schema = 'auth',
): string {
    const className = toEntityClassName(modelKey);
    const entityOptions = schema ? `, { schema: '${schema}' }` : '';
    const lines = [
        `import { Column, Entity, PrimaryColumn } from 'typeorm';`,
        '',
        `@Entity('${table.modelName}'${entityOptions})`,
        `export class ${className} {`,
        `  @PrimaryColumn('text')`,
        `  id!: string;`,
        '',
    ];

    for (const [fieldKey, field] of Object.entries(table.fields)) {
        if (fieldKey === 'id') continue;

        const columnName = field.fieldName ?? fieldKey;
        const { columnType, tsType } = mapFieldToTypeormColumn(field, dbType);
        const options: string[] = [`name: '${columnName}'`];

        if (field.required === false) {
            options.push('nullable: true');
        } else {
            options.push('nullable: false');
        }

        if (field.unique || columnName === 'email' || columnName === 'token') {
            options.push('unique: true');
        }

        const decoratorArgs = options.length > 0 ? `, { ${options.join(', ')} }` : '';
        lines.push(`  @Column('${columnType}'${decoratorArgs})`);
        lines.push(`  ${fieldKey}!: ${tsType};`);
        lines.push('');
    }

    lines.push('}');
    lines.push('');

    return lines.join('\n');
}
