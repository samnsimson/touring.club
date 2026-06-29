import { createAuth } from '../src/lib/auth.config';

/** Used by `bun run auth:generate` — Better Auth CLI expects a synchronous `auth` export. */
export const auth = createAuth();
