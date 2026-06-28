import { Injectable, UseGuards } from '@nestjs/common';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server } from 'socket.io';
import { WsAuthGuard } from '@tc/auth';
import type { AuthenticatedSocket } from '@tc/auth';
import { MessageResponse } from '../dto';
import { ConversationParticipantRepository } from '../repositories';

@Injectable()
@WebSocketGateway({ namespace: '/conversations' })
export class ConversationsGateway {
    constructor(private readonly participants: ConversationParticipantRepository) {}

    @WebSocketServer()
    private readonly server!: Server;

    @UseGuards(WsAuthGuard)
    @SubscribeMessage('conversations:join')
    async handleJoin(@ConnectedSocket() client: AuthenticatedSocket): Promise<{ joined: true }> {
        const memberships = await this.participants.findByUserId(client.data.userId as string);
        for (const participant of memberships) client.join(`conversation:${participant.conversationId}`);
        return { joined: true };
    }

    emitNewMessage(conversationId: string, message: MessageResponse): void {
        this.server?.to(`conversation:${conversationId}`).emit('message:new', message);
    }
}
