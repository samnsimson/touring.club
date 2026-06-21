import type { DBFieldAttribute } from 'better-auth/db';
import { mapFieldToTypeormColumn } from './column-type';
import { toEntityClassName } from './schema-paths';

type TableDefinition = {
    modelName: string;
    fields: Record<string, DBFieldAttribute>;
};

type AlterChanges = {
    addColumns: { name: string; field: DBFieldAttribute }[];
    dropColumns: string[];
};

function migrationClassName(modelKey: string, timestamp: number, action: 'Create' | 'Alter'): string {
    return `${action}${toEntityClassName(modelKey)}${timestamp}`;
}

function buildColumnDefinition(name: string, field: DBFieldAttribute, dbType: string, includeNullable = true): string {
    const columnName = field.fieldName ?? name;
    const { columnType, length } = mapFieldToTypeormColumn(field, dbType);
    const lines = [`name: '${columnName}'`, `type: '${columnType}'`];

    if (length) {
        lines.push(`length: '${length}'`);
    }

    if (includeNullable && name !== 'id') {
        lines.push(`isNullable: ${field.required === false}`);
    }

    if (field.unique || columnName === 'email' || columnName === 'token') {
        lines.push('isUnique: true');
    }

    return `          {
            ${lines.join(',\n            ')}
          }`;
}

function buildUniqueIndexes(tableName: string, fields: Record<string, DBFieldAttribute>): string {
    const indexes: string[] = [];

    for (const [fieldKey, field] of Object.entries(fields)) {
        const columnName = field.fieldName ?? fieldKey;
        if (!field.unique && columnName !== 'email' && columnName !== 'token') continue;

        indexes.push(`    await queryRunner.createIndex(
      '${tableName}',
      new TableIndex({
        name: 'IDX_${tableName}_${columnName}',
        columnNames: ['${columnName}'],
        isUnique: true,
      }),
    );`);
    }

    return indexes.join('\n\n');
}

export function generateCreateMigration(modelKey: string, table: TableDefinition, timestamp: number, dbType: string): string {
    const className = migrationClassName(modelKey, timestamp, 'Create');
    const columns = [
        `          {
            name: 'id',
            type: 'text',
            isPrimary: true,
          }`,
        ...Object.entries(table.fields)
            .filter(([fieldKey]) => fieldKey !== 'id')
            .map(([fieldKey, field]) => buildColumnDefinition(fieldKey, field, dbType)),
    ];

    const indexes = buildUniqueIndexes(table.modelName, table.fields);

    return `import { type MigrationInterface, type QueryRunner, Table, TableIndex } from 'typeorm';

export class ${className} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: '${table.modelName}',
        columns: [
${columns.join(',\n')}
        ],
      }),
    );

${indexes ? `${indexes}\n` : ''}  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('${table.modelName}');
  }
}
`;
}

export function generateAlterMigration(
    modelKey: string,
    table: TableDefinition,
    timestamp: number,
    dbType: string,
    changes: AlterChanges,
): string {
    const className = migrationClassName(modelKey, timestamp, 'Alter');
    const up: string[] = [];
    const down: string[] = [];

    for (const { name, field } of changes.addColumns) {
        const columnName = field.fieldName ?? name;
        const { columnType } = mapFieldToTypeormColumn(field, dbType);
        up.push(`    await queryRunner.addColumn('${table.modelName}', new TableColumn({
      name: '${columnName}',
      type: '${columnType}',
      isNullable: ${field.required === false}${field.unique ? ',\n      isUnique: true' : ''}
    }));`);
        down.push(`    await queryRunner.dropColumn('${table.modelName}', '${columnName}');`);
    }

    for (const columnName of changes.dropColumns) {
        up.push(`    await queryRunner.dropColumn('${table.modelName}', '${columnName}');`);
        down.push(`    await queryRunner.addColumn('${table.modelName}', new TableColumn({
      name: '${columnName}',
      type: 'text',
      isNullable: true,
    }));`);
    }

    return `import { type MigrationInterface, type QueryRunner, TableColumn } from 'typeorm';

export class ${className} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
${up.join('\n\n')}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
${down.join('\n\n')}
  }
}
`;
}
