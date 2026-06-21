import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { BetterAuthError } from 'better-auth';
import { initGetModelName } from 'better-auth/adapters';
import type { DBAdapterSchemaCreation } from 'better-auth/adapters';
import type { BetterAuthDBSchema, DBFieldAttribute } from 'better-auth/db';
import type { AdapterConfig } from '../adapter.config';
import { generateEntitySource } from './generate-entity';
import { resolveSchemaPaths, toEntityClassName } from './schema-paths';

type CreateSchemaParams = {
    dbType: string;
    config: AdapterConfig;
    tables: BetterAuthDBSchema;
    file?: string;
};

type TableDefinition = {
    modelName: string;
    fields: Record<string, DBFieldAttribute>;
};

export async function createTypeormSchema({
    dbType,
    config,
    tables,
    file,
}: CreateSchemaParams): Promise<DBAdapterSchemaCreation> {
    try {
        const cwd = process.cwd();
        const { entitiesDir } = resolveSchemaPaths(config, cwd);
        const changelogPath = file ?? join(config.outputDir ?? 'library/database/src', 'CHANGELOG.md');
        const getModelName = initGetModelName({ schema: tables, usePlural: config.usePlural });

        mkdirSync(entitiesDir, { recursive: true });

        let changelog = `# TypeORM entities\n\nGenerated at ${new Date().toISOString()}\n\n`;
        let hasChanges = false;

        for (const modelKey of Object.keys(tables)) {
            const table: TableDefinition = {
                modelName: getModelName(modelKey),
                fields: tables[modelKey]!.fields,
            };
            const entityFileName = `${toEntityClassName(modelKey)}.ts`;
            const entityPath = join(entitiesDir, entityFileName);
            const content = generateEntitySource(modelKey, table, dbType);
            const existed = existsSync(entityPath);
            const unchanged = existed && readFileSync(entityPath, 'utf8') === content;

            if (unchanged) {
                continue;
            }

            writeFileSync(entityPath, content);
            changelog += `- ${existed ? 'UPDATE' : 'CREATE'} \`${table.modelName}\` → ${relative(cwd, entityPath)}\n`;
            hasChanges = true;
        }

        if (!hasChanges) {
            return {
                code: 'Entity files are already up to date.',
                path: changelogPath,
                overwrite: existsSync(changelogPath),
            };
        }

        changelog += '\n';

        return {
            code: changelog,
            path: changelogPath,
            overwrite: existsSync(changelogPath),
        };
    } catch (error) {
        throw new BetterAuthError(`Failed to create TypeORM schema: ${error instanceof Error ? error.message : String(error)}`);
    }
}
