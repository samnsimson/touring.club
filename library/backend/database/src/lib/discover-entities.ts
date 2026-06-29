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

function isIgnoredFile(file: string, ignoredFiles: Iterable<string>): boolean {
    const ignoredBasenames = new Set(Array.from(ignoredFiles, (name) => name.replace(/\.(ts|js)$/, '')));
    return ignoredBasenames.has(file.replace(/\.(ts|js)$/, ''));
}

export function discoverEntities(moduleUrl: string, ignoredFiles: Iterable<string>, loadModule?: EntityModuleLoader): (new () => object)[] {
    const dir = dirname(fileURLToPath(moduleUrl));
    const requireModule = createRequire(moduleUrl);
    const load = loadModule ?? ((filePath: string) => requireModule(filePath));
    const entities: (new () => object)[] = [];

    for (const file of readdirSync(dir)) {
        if (isIgnoredFile(file, ignoredFiles) || (!file.endsWith('.ts') && !file.endsWith('.js'))) continue;

        entities.push(...collectEntityClasses(load(join(dir, file))));
    }

    return entities;
}
