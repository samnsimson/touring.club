import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationResponse, CreateDirectConversationDto, MessageResponse, SendMessageDto } from './dto';
import { ConversationParticipantRepository, ConversationRepository, MessageRepository } from './repositories';

@Injectable()
export class AppService {
    constructor(
        private readonly conversations: ConversationRepository,
        private readonly participants: ConversationParticipantRepository,
        private readonly messages: MessageRepository,
    ) {}

    async createDirectConversation(userId: string, dto: CreateDirectConversationDto) {
        if (dto.participantUserId === userId) throw new BadRequestException('Cannot start a conversation with yourself');

        const existing = await this.conversations.findDirectBetweenUsers(userId, dto.participantUserId);
        if (existing) return { conversation: ConversationResponse.from(existing) };

        const conversation = await this.conversations.save(this.conversations.create({ type: 'direct', tripId: null }));
        await this.participants.save([
            this.participants.create({ conversationId: conversation.id, userId }),
            this.participants.create({ conversationId: conversation.id, userId: dto.participantUserId }),
        ]);

        return { conversation: ConversationResponse.from(conversation) };
    }

    async listConversations(userId: string) {
        const conversations = await this.conversations.findForUser(userId);
        return { conversations: conversations.map((conversation) => ConversationResponse.from(conversation)) };
    }

    async listMessages(userId: string, conversationId: string) {
        await this.requireParticipant(conversationId, userId);
        const messages = await this.messages.findByConversationId(conversationId);
        return { messages: messages.map((message) => MessageResponse.from(message)) };
    }

    async sendMessage(userId: string, conversationId: string, dto: SendMessageDto) {
        await this.requireParticipant(conversationId, userId);
        const message = await this.messages.save(
            this.messages.create({
                conversationId,
                senderId: userId,
                messageType: 'text',
                body: dto.body,
            }),
        );
        await this.conversations.update({ id: conversationId }, { updatedAt: new Date() });
        return { message: MessageResponse.from(message) };
    }

    private async requireParticipant(conversationId: string, userId: string) {
        const participant = await this.participants.findByConversationAndUser(conversationId, userId);
        if (!participant) throw new NotFoundException('Conversation not found');
    }
}
