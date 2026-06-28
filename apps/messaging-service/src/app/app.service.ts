import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Conversation, ConversationParticipant, Message } from '@tc/database';
import { CreateDirectConversationDto, SendMessageDto } from './dto';
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
        if (existing) return { conversation: this.toConversationDto(existing) };

        const conversation = await this.conversations.save(this.conversations.create({ type: 'direct', tripId: null }));
        await this.participants.save([
            this.participants.create({ conversationId: conversation.id, userId }),
            this.participants.create({ conversationId: conversation.id, userId: dto.participantUserId }),
        ]);

        return { conversation: this.toConversationDto(conversation) };
    }

    async listConversations(userId: string) {
        const conversations = await this.conversations.findForUser(userId);
        return { conversations: conversations.map((conversation) => this.toConversationDto(conversation)) };
    }

    async listMessages(userId: string, conversationId: string) {
        await this.requireParticipant(conversationId, userId);
        const messages = await this.messages.findByConversationId(conversationId);
        return { messages: messages.map((message) => this.toMessageDto(message)) };
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
        return { message: this.toMessageDto(message) };
    }

    private async requireParticipant(conversationId: string, userId: string) {
        const participant = await this.participants.findByConversationAndUser(conversationId, userId);
        if (!participant) throw new NotFoundException('Conversation not found');
    }

    private toConversationDto(conversation: Conversation) {
        return {
            id: conversation.id,
            type: conversation.type,
            tripId: conversation.tripId,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }

    private toMessageDto(message: Message) {
        return {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            messageType: message.messageType,
            body: message.body,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
        };
    }
}
