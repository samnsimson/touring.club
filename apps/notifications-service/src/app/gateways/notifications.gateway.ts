import { Injectable, UseGuards } from '@nestjs/common';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server } from 'socket.io';
import { WsAuthGuard } from '@tc/auth';
import type { AuthenticatedSocket } from '@tc/auth';
import { NotificationResponse } from '../dto';

@Injectable()
@WebSocketGateway({ namespace: '/notifications' })
export class NotificationsGateway {
    @WebSocketServer()
    private readonly server!: Server;

    @UseGuards(WsAuthGuard)
    @SubscribeMessage('notifications:join')
    handleJoin(@ConnectedSocket() client: AuthenticatedSocket): { joined: true } {
        client.join(`notifications:user:${client.data.userId}`);
        return { joined: true };
    }

    emitNotificationCreated(userId: string, notification: NotificationResponse): void {
        this.server?.to(`notifications:user:${userId}`).emit('notification:created', notification);
    }
}
