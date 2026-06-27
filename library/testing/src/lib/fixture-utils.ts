import fs from 'node:fs';
import path from 'node:path';

export function loadFixture<T>(fixturesDir: string, name: string): T {
    const fixturePath = path.join(fixturesDir, `${name}.fixture.json`);
    const raw = fs.readFileSync(fixturePath, 'utf8');
    return JSON.parse(raw) as T;
}

export function interpolateFixture<T>(template: T, vars: Record<string, string>): T {
    if (typeof template === 'string') {
        return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '') as T;
    }

    if (Array.isArray(template)) {
        return template.map((entry) => interpolateFixture(entry, vars)) as T;
    }

    if (template && typeof template === 'object') {
        return Object.fromEntries(Object.entries(template as Record<string, unknown>).map(([key, value]) => [key, interpolateFixture(value, vars)])) as T;
    }

    return template;
}
