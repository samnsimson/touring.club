import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { discoverEntities } from '../../src/lib/discover-entities';
import { ENTITIES } from '../../src/entities';

describe('entity directory discovery', () => {
    it('discovers auth entity classes from entities/auth', () => {
        const indexUrl = pathToFileURL(join(__dirname, '../../src/entities/auth/index.ts')).href;
        const entities = discoverEntities(indexUrl, ['index.ts']);
        expect(entities.map((entity) => entity.name).sort()).toEqual(['Account', 'Jwks', 'Session', 'User', 'Verification']);
    });

    it('discovers general entity classes from entities/general', () => {
        const indexUrl = pathToFileURL(join(__dirname, '../../src/entities/general/index.ts')).href;
        const entities = discoverEntities(indexUrl, ['base.entity.ts', 'index.ts']);
        expect(entities.map((entity) => entity.name)).toEqual(['Profile']);
    });

    it('ENTITIES registry includes all discovered entity classes', () => {
        const authUrl = pathToFileURL(join(__dirname, '../../src/entities/auth/index.ts')).href;
        const generalUrl = pathToFileURL(join(__dirname, '../../src/entities/general/index.ts')).href;
        const discovered = [...discoverEntities(authUrl, ['index.ts']), ...discoverEntities(generalUrl, ['base.entity.ts', 'index.ts'])];
        expect(ENTITIES.map((entity) => entity.name).sort()).toEqual(discovered.map((entity) => entity.name).sort());
    });
});
