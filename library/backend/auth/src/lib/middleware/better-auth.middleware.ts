import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { toNodeHandler } from 'better-auth/node';
import type { NextFunction, Request, Response } from 'express';
import { AUTH_BASE_PATH } from '../constants/auth.constants';

@Injectable()
export class BetterAuthMiddleware implements NestMiddleware {
    private handler?: ReturnType<typeof toNodeHandler>;

    constructor(private readonly authService: AuthService) {}

    use(req: Request, res: Response, next: NextFunction): void {
        const path = req.originalUrl ?? req.url ?? '';
        if (!path.startsWith(AUTH_BASE_PATH)) return next();
        if (!this.handler) this.handler = toNodeHandler(this.authService.instance);
        void this.handler(req, res);
    }
}
