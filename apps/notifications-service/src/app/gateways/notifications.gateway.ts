import { Injectable, UseGuards } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server } from 'socket.io';
import { AuthenticatedSocket, WsAuthGuard } from '@tc/auth';
import { NotificationResponse } from '../dto';

@Injectable()
@UseGuards(WsAuthGuard)
@WebSocketGateway({ namespace: '/notifications' })
export class NotificationsGateway implements OnGatewayConnection {
    @WebSocketServer()
    private readonly server!: Server;

    handleConnection(client: AuthenticatedSocket): void {
        const userId = client.data.userId;
        if (!userId) {
            client.disconnect(true);
            return;
        }
        client.join(`notifications:user:${userId}`);
    }

    emitNotificationCreated(userId: string, notification: NotificationResponse): void {
        this.server?.to(`notifications:user:${userId}`).emit('notification:created', notification);
    }
}
