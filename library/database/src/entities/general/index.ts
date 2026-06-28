import { discoverEntities } from '../../lib/discover-entities';

export const generalEntities = discoverEntities(import.meta.url, ['base.entity.ts', 'index.ts']);
