import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthUtils } from '../utils/auth.utils';
import { AuthenticatedSocket } from '../contracts/auth.contract';

@Injectable()
export class WsAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient<AuthenticatedSocket>();
            const token = this.getHandshakeToken(client);
            if (!token) throw new WsException('Missing authentication token');
            const session = await AuthUtils.verifyAuthToken(token);
            client.data.userId = AuthUtils.resolveSessionUserId(session);
            return true;
        } catch {
            throw new WsException('Invalid or expired authentication token');
        }
    }

    private getHandshakeToken(client: Socket): string | undefined {
        const authToken = client.handshake.auth?.['token'];
        if (typeof authToken === 'string' && authToken) return authToken;
        const queryToken = client.handshake.query?.['token'];
        if (typeof queryToken === 'string' && queryToken) return queryToken;
        return undefined;
    }
}
