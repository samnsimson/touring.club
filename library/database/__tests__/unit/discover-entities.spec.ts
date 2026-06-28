import { readdirSync } from 'node:fs';
import { collectEntityClasses, discoverEntities, isEntityClass } from '../../src/lib/discover-entities';

jest.mock('node:fs', () => ({
    readdirSync: jest.fn(),
}));

describe('isEntityClass', () => {
    class SampleEntity {}

    class BaseEntity {}

    it('accepts PascalCase entity classes', () => {
        expect(isEntityClass(SampleEntity)).toBe(true);
    });

    it('rejects camelCase functions', () => {
        const defaultSettings = () => undefined;
        expect(isEntityClass(defaultSettings)).toBe(false);
    });

    it('rejects the shared BaseEntity class name', () => {
        expect(isEntityClass(BaseEntity)).toBe(false);
    });

    it('rejects non-functions', () => {
        expect(isEntityClass({ name: 'SampleEntity' })).toBe(false);
    });
});

describe('collectEntityClasses', () => {
    class SampleEntity {}

    class BaseEntity {}

    it('collects entity classes and ignores helpers', () => {
        const defaultSettings = () => undefined;
        const entities = collectEntityClasses({ SampleEntity, BaseEntity, defaultSettings });
        expect(entities).toEqual([SampleEntity]);
    });
});

describe('discoverEntities', () => {
    const readdirSyncMock = readdirSync as jest.MockedFunction<typeof readdirSync>;

    beforeEach(() => {
        readdirSyncMock.mockReset();
    });

    it('loads entity classes from non-ignored TypeScript files', () => {
        class SampleEntity {}
        readdirSyncMock.mockReturnValue(['Sample.ts', 'index.ts', 'helpers.ts'] as unknown as ReturnType<typeof readdirSync>);
        const loadModule = jest.fn((filePath: string) => {
            if (filePath.endsWith('Sample.ts')) return { SampleEntity };
            if (filePath.endsWith('helpers.ts')) {
                const defaultSettings = () => undefined;
                return { defaultSettings };
            }
            return {};
        });
        const entities = discoverEntities('file:///tmp/entities/index.ts', ['index.ts'], loadModule);
        expect(entities).toEqual([SampleEntity]);
        expect(loadModule).toHaveBeenCalledTimes(2);
        expect(loadModule).toHaveBeenCalledWith('/tmp/entities/Sample.ts');
        expect(loadModule).toHaveBeenCalledWith('/tmp/entities/helpers.ts');
    });

    it('skips ignored files and non-TypeScript files', () => {
        class IgnoredEntity {}
        readdirSyncMock.mockReturnValue(['base.entity.ts', 'index.ts', 'notes.txt', 'Included.ts'] as unknown as ReturnType<typeof readdirSync>);
        const loadModule = jest.fn(() => ({ IgnoredEntity }));
        const entities = discoverEntities('file:///tmp/general/index.ts', ['base.entity.ts', 'index.ts'], loadModule);
        expect(entities).toEqual([IgnoredEntity]);
        expect(loadModule).toHaveBeenCalledTimes(1);
        expect(loadModule).toHaveBeenCalledWith('/tmp/general/Included.ts');
    });

    it('loads compiled JavaScript entity files', () => {
        class CompiledEntity {}
        readdirSyncMock.mockReturnValue(['Compiled.js', 'index.js'] as unknown as ReturnType<typeof readdirSync>);
        const loadModule = jest.fn((filePath: string) => (filePath.endsWith('Compiled.js') ? { CompiledEntity } : {}));
        const entities = discoverEntities('file:///tmp/entities/index.js', ['index.js'], loadModule);
        expect(entities).toEqual([CompiledEntity]);
    });
});
