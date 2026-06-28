import { discoverEntities } from '../../lib/discover-entities';

/** Entity classes under `entities/auth/` — discovered automatically. */
export const authEntities = discoverEntities(import.meta.url, ['index.ts']);
