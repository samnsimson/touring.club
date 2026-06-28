import { Injectable, UseGuards } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server } from 'socket.io';
import { AuthenticatedSocket, WsAuthGuard } from '@tc/auth';
import { MessageResponse } from '../dto';
import { ConversationParticipantRepository } from '../repositories';

@Injectable()
@UseGuards(WsAuthGuard)
@WebSocketGateway({ namespace: '/conversations' })
export class ConversationsGateway implements OnGatewayConnection {
    constructor(private readonly participants: ConversationParticipantRepository) {}

    @WebSocketServer()
    private readonly server!: Server;

    async handleConnection(client: AuthenticatedSocket): Promise<void> {
        const userId = client.data.userId;
        if (!userId) {
            client.disconnect(true);
            return;
        }
        const memberships = await this.participants.findByUserId(userId);
        for (const participant of memberships) client.join(`conversation:${participant.conversationId}`);
    }

    emitNewMessage(conversationId: string, message: MessageResponse): void {
        this.server?.to(`conversation:${conversationId}`).emit('message:new', message);
    }
}
