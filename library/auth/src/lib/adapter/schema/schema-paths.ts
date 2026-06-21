import { resolve } from 'node:path';
import type { AdapterConfig } from '../adapter.config';

const DEFAULT_OUTPUT_DIR = 'library/database/src';

export function resolveSchemaPaths(config: AdapterConfig, cwd = process.cwd()) {
    const outputDir = resolve(cwd, config.outputDir ?? DEFAULT_OUTPUT_DIR);
    const entitiesDir = resolve(cwd, config.entitiesDir ?? `${config.outputDir ?? DEFAULT_OUTPUT_DIR}/entities`);

    return { outputDir, entitiesDir };
}

export function toEntityClassName(modelKey: string): string {
    return modelKey.charAt(0).toUpperCase() + modelKey.slice(1);
}
