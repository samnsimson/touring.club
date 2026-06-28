import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { discoverEntities } from '../../src/lib/discover-entities';

describe('entity directory discovery', () => {
    it('discovers auth entity classes from entities/auth', async () => {
        const indexUrl = pathToFileURL(join(__dirname, '../../src/entities/auth/index.ts')).href;
        const entities = await discoverEntities(indexUrl, ['index.ts']);
        expect(entities.map((entity) => entity.name).sort()).toEqual(['Account', 'Jwks', 'Session', 'User', 'Verification']);
    });

    it('discovers general entity classes from entities/general', async () => {
        const indexUrl = pathToFileURL(join(__dirname, '../../src/entities/general/index.ts')).href;
        const entities = await discoverEntities(indexUrl, ['base.entity.ts', 'index.ts']);
        expect(entities.map((entity) => entity.name)).toEqual(['Profile']);
    });
});
