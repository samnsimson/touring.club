import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export function isEntityClass(value: unknown): value is new () => object {
    return typeof value === 'function' && /^[A-Z]/.test(value.name) && value.name !== 'BaseEntity';
}

export function collectEntityClasses(module: Record<string, unknown>): (new () => object)[] {
    return Object.values(module).filter(isEntityClass);
}

export type EntityModuleLoader = (filePath: string) => Promise<Record<string, unknown>>;

export async function discoverEntities(
    moduleUrl: string,
    ignoredFiles: Iterable<string>,
    loadModule: EntityModuleLoader = (filePath) => import(pathToFileURL(filePath).href),
): Promise<(new () => object)[]> {
    const ignored = new Set(ignoredFiles);
    const dir = dirname(fileURLToPath(moduleUrl));
    const entities: (new () => object)[] = [];

    for (const file of readdirSync(dir)) {
        if (!file.endsWith('.ts') || ignored.has(file)) continue;

        const mod = await loadModule(join(dir, file));
        entities.push(...collectEntityClasses(mod));
    }

    return entities;
}
