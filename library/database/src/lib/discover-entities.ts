import { createRequire } from 'node:module';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function isEntityClass(value: unknown): value is new () => object {
    return typeof value === 'function' && /^[A-Z]/.test(value.name) && value.name !== 'BaseEntity';
}

export function collectEntityClasses(module: Record<string, unknown>): (new () => object)[] {
    return Object.values(module).filter(isEntityClass);
}

export type EntityModuleLoader = (filePath: string) => Record<string, unknown>;

export function discoverEntities(moduleUrl: string, ignoredFiles: Iterable<string>, loadModule?: EntityModuleLoader): (new () => object)[] {
    const ignored = new Set(ignoredFiles);
    const dir = dirname(fileURLToPath(moduleUrl));
    const requireModule = createRequire(moduleUrl);
    const load = loadModule ?? ((filePath: string) => requireModule(filePath));
    const entities: (new () => object)[] = [];

    for (const file of readdirSync(dir)) {
        if (ignored.has(file) || (!file.endsWith('.ts') && !file.endsWith('.js'))) continue;

        entities.push(...collectEntityClasses(load(join(dir, file))));
    }

    return entities;
}
