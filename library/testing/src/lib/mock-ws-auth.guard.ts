import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

type AuthenticatedSocket = Socket & { data: { userId?: string } };

function getHandshakeToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.['token'];
    if (typeof authToken === 'string' && authToken) return authToken;
    const queryToken = client.handshake.query?.['token'];
    if (typeof queryToken === 'string' && queryToken) return queryToken;
    return undefined;
}

/** E2e guard: treats the handshake token as an authenticated userId, no JWKS verification. */
@Injectable()
export class MockWsAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const client = context.switchToWs().getClient<AuthenticatedSocket>();
        const token = getHandshakeToken(client);
        if (!token) throw new WsException('Missing authentication token');
        client.data.userId = token;
        return true;
    }
}
