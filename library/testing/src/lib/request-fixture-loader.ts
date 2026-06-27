import fs from 'node:fs';
import path from 'node:path';
import type { RequestFixtureLoaderOptions } from './testing.contracts';

export class RequestFixtureLoader {
    static readonly defaultFixturesDir = 'fixtures/requests';
    private readonly fixturesDir: string;

    constructor(options: RequestFixtureLoaderOptions = {}) {
        this.fixturesDir = options.fixturesDir ?? RequestFixtureLoader.defaultFixturesDir;
    }

    load<T>(name: string): T {
        const fixturePath = path.resolve(process.cwd(), this.fixturesDir, `${name}.request.json`);
        if (!fs.existsSync(fixturePath)) throw new Error(`Request fixture "${name}" not found at ${fixturePath}`);
        return JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as T;
    }
}
