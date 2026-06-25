import type { IncomingMessage, ServerResponse } from 'node:http';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.config';
import { AUTH_BASE_PATH } from './auth.constants';

export type BetterAuthMiddleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

/** Express-compatible middleware that serves Better Auth HTTP routes (e.g. `/api/auth/docs`, `/api/auth/jwks`). */
export function createBetterAuthMiddleware(): BetterAuthMiddleware {
    const handler = toNodeHandler(auth);
    return (req, res, next) => {
        const request = req as IncomingMessage & { originalUrl?: string };
        const path = request.originalUrl ?? request.url ?? '';
        if (!path.startsWith(AUTH_BASE_PATH)) {
            next();
            return;
        }

        void handler(req, res);
    };
}
