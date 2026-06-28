import { discoverEntities } from '../../lib/discover-entities';

export const generalEntities = await discoverEntities(import.meta.url, ['base.entity.ts', 'index.ts']);
