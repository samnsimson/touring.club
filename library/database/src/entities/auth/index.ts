import { discoverEntities } from '../../lib/discover-entities';

/** Entity classes under `entities/auth/` — discovered automatically for the TypeORM CLI. */
export const authEntities = await discoverEntities(import.meta.url, ['index.ts']);
