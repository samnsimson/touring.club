import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { verifyAuthToken } from '../auth.token';
import { resolveSessionUserId } from './auth.request';

export type AuthenticatedSocket = Socket & {
    data: { userId?: string };
};

function getHandshakeToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.['token'];
    if (typeof authToken === 'string' && authToken) return authToken;
    const queryToken = client.handshake.query?.['token'];
    if (typeof queryToken === 'string' && queryToken) return queryToken;
    return undefined;
}

@Injectable()
export class WsAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient<AuthenticatedSocket>();
            const token = getHandshakeToken(client);
            if (!token) throw new WsException('Missing authentication token');
            const session = await verifyAuthToken(token);
            client.data.userId = resolveSessionUserId(session);
            return true;
        } catch {
            throw new WsException('Invalid or expired authentication token');
        }
    }
}
