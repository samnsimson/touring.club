import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { BetterAuthError } from 'better-auth';
import { initGetModelName } from 'better-auth/adapters';
import type { DBAdapterSchemaCreation } from 'better-auth/adapters';
import type { BetterAuthDBSchema, DBFieldAttribute } from 'better-auth/db';
import type { DataSource } from 'typeorm';
import type { AdapterConfig } from '../adapter.config';
import { generateCreateMigration, generateAlterMigration } from './generate-migration';
import { generateEntitySource } from './generate-entity';
import { resolveSchemaPaths, toEntityClassName } from './schema-paths';

type CreateSchemaParams = {
    dataSource: DataSource;
    dbType: string;
    config: AdapterConfig;
    tables: BetterAuthDBSchema;
    file?: string;
};

type TableDefinition = {
    modelName: string;
    fields: Record<string, DBFieldAttribute>;
};

type ExistingColumn = {
    name: string;
};

function getExistingColumns(dataSource: DataSource): Map<string, ExistingColumn[]> {
    const columnsByTable = new Map<string, ExistingColumn[]>();

    for (const metadata of dataSource.entityMetadatas) {
        columnsByTable.set(
            metadata.tableName,
            metadata.columns.map((column) => ({ name: column.databaseName })),
        );
    }

    return columnsByTable;
}

export async function createTypeormSchema({
    dataSource,
    dbType,
    config,
    tables,
    file,
}: CreateSchemaParams): Promise<DBAdapterSchemaCreation> {
    try {
        const cwd = process.cwd();
        const { outputDir, entitiesDir, migrationsDir } = resolveSchemaPaths(config, cwd);
        const changelogPath = file ?? join(config.outputDir ?? 'library/database/src', 'CHANGELOG.md');
        const getModelName = initGetModelName({ schema: tables, usePlural: config.usePlural });
        const resolveTable = (modelKey: string): TableDefinition => ({
            modelName: getModelName(modelKey),
            fields: tables[modelKey]!.fields,
        });
        const existingTableNames = new Set(dataSource.entityMetadatas.map((metadata) => metadata.tableName));
        const existingColumns = getExistingColumns(dataSource);
        const timestamp = Date.now();

        mkdirSync(entitiesDir, { recursive: true });
        mkdirSync(migrationsDir, { recursive: true });

        const tableKeys = Object.keys(tables);
        const tablesToCreate = tableKeys.filter((key) => !existingTableNames.has(getModelName(key)));
        const tablesToAlter = tableKeys.filter((key) => existingTableNames.has(getModelName(key)));

        if (tablesToCreate.length === 0 && tablesToAlter.length === 0) {
            return {
                code: 'No pending schema changes found.',
                path: changelogPath,
                overwrite: existsSync(changelogPath),
            };
        }

        let changelog = `# TypeORM schema changes\n\nGenerated at ${new Date().toISOString()}\n\n`;
        let hasChanges = false;

        for (const modelKey of tablesToCreate) {
            const table = resolveTable(modelKey);
            const entityFileName = `${toEntityClassName(modelKey)}.ts`;
            const migrationFileName = `${timestamp}-create-${modelKey}.ts`;

            writeFileSync(join(entitiesDir, entityFileName), generateEntitySource(modelKey, table, dbType));
            writeFileSync(join(migrationsDir, migrationFileName), generateCreateMigration(modelKey, table, timestamp, dbType));

            changelog += `- CREATE \`${table.modelName}\`\n`;
            changelog += `  - entity: ${relative(cwd, join(entitiesDir, entityFileName))}\n`;
            changelog += `  - migration: ${relative(cwd, join(migrationsDir, migrationFileName))}\n\n`;
            hasChanges = true;
        }

        for (const modelKey of tablesToAlter) {
            const table = resolveTable(modelKey);
            const currentColumns = existingColumns.get(table.modelName) ?? [];
            const currentColumnNames = new Set(currentColumns.map((column) => column.name));
            const schemaColumnNames = new Set(
                Object.entries(table.fields).map(([fieldKey, field]) => field.fieldName ?? fieldKey),
            );

            const addColumns = Object.entries(table.fields)
                .filter(([fieldKey, field]) => {
                    const columnName = field.fieldName ?? fieldKey;
                    return fieldKey !== 'id' && !currentColumnNames.has(columnName);
                })
                .map(([name, field]) => ({ name, field }));

            const dropColumns = [...currentColumnNames].filter((columnName) => columnName !== 'id' && !schemaColumnNames.has(columnName));

            if (addColumns.length === 0 && dropColumns.length === 0) {
                continue;
            }

            const entityFileName = `${toEntityClassName(modelKey)}.ts`;
            const migrationFileName = `${timestamp}-alter-${modelKey}.ts`;

            writeFileSync(join(entitiesDir, entityFileName), generateEntitySource(modelKey, table, dbType));
            writeFileSync(
                join(migrationsDir, migrationFileName),
                generateAlterMigration(modelKey, table, timestamp, dbType, { addColumns, dropColumns }),
            );

            changelog += `- ALTER \`${table.modelName}\`\n`;
            changelog += `  - entity: ${relative(cwd, join(entitiesDir, entityFileName))}\n`;
            changelog += `  - migration: ${relative(cwd, join(migrationsDir, migrationFileName))}\n`;

            if (addColumns.length > 0) {
                changelog += `  - added columns: ${addColumns.map(({ name, field }) => field.fieldName ?? name).join(', ')}\n`;
            }

            if (dropColumns.length > 0) {
                changelog += `  - removed columns: ${dropColumns.join(', ')}\n`;
            }

            changelog += '\n';
            hasChanges = true;
        }

        if (!hasChanges) {
            return {
                code: 'No pending schema changes found.',
                path: changelogPath,
                overwrite: existsSync(changelogPath),
            };
        }

        return {
            code: changelog,
            path: changelogPath,
            overwrite: existsSync(changelogPath),
        };
    } catch (error) {
        throw new BetterAuthError(`Failed to create TypeORM schema: ${error instanceof Error ? error.message : String(error)}`);
    }
}
