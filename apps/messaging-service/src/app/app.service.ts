import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Conversation, Trip } from '@tc/database';
import { ConversationResponse, CreateDirectConversationDto, MessageResponse, PostTripSystemEventDto, SendMessageDto } from './dto';
import { ConversationParticipantRepository, ConversationRepository, MessageRepository, TripMembershipRepository, TripRepository } from './repositories';

@Injectable()
export class AppService {
    constructor(
        private readonly conversations: ConversationRepository,
        private readonly participants: ConversationParticipantRepository,
        private readonly messages: MessageRepository,
        private readonly trips: TripRepository,
        private readonly memberships: TripMembershipRepository,
    ) {}

    async createDirectConversation(userId: string, dto: CreateDirectConversationDto) {
        if (dto.participantUserId === userId) throw new BadRequestException('Cannot start a conversation with yourself');

        const existing = await this.conversations.findDirectBetweenUsers(userId, dto.participantUserId);
        if (existing) return { conversation: ConversationResponse.from(existing) };

        const conversation = await this.conversations.save(this.conversations.create({ type: 'direct' }));
        await this.participants.save([
            this.participants.create({ conversation, userId }),
            this.participants.create({ conversation, userId: dto.participantUserId }),
        ]);

        return { conversation: ConversationResponse.from(conversation) };
    }

    async listConversations(userId: string) {
        const conversations = await this.conversations.findForUser(userId);
        return { conversations: conversations.map((conversation) => ConversationResponse.from(conversation)) };
    }

    async getTripConversation(userId: string, tripId: string) {
        const conversation = await this.ensureTripConversation(tripId, userId);
        return { conversation: ConversationResponse.from(conversation) };
    }

    async listTripMessages(userId: string, tripId: string) {
        const conversation = await this.ensureTripConversation(tripId, userId);
        const messages = await this.messages.findByConversationId(conversation.id);
        return { messages: messages.map((message) => MessageResponse.from(message)) };
    }

    async sendTripMessage(userId: string, tripId: string, dto: SendMessageDto) {
        const conversation = await this.ensureTripConversation(tripId, userId);
        return this.sendMessage(userId, conversation.id, dto);
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
                conversation: { id: conversationId } as Conversation,
                senderId: userId,
                messageType: 'text',
                body: dto.body,
            }),
        );
        await this.conversations.update({ id: conversationId }, { updatedAt: new Date() });
        return { message: MessageResponse.from(message) };
    }

    async postTripSystemEvent(tripId: string, dto: PostTripSystemEventDto) {
        const conversation = await this.ensureTripConversationForSystemEvent(tripId);
        const message = await this.messages.save(
            this.messages.create({
                conversation: { id: conversation.id } as Conversation,
                senderId: dto.actorUserId,
                messageType: 'system',
                body: JSON.stringify({ event: dto.event, userId: dto.subjectUserId }),
            }),
        );
        await this.conversations.update({ id: conversation.id }, { updatedAt: new Date() });
        return { message: MessageResponse.from(message) };
    }

    private async ensureTripConversationForSystemEvent(tripId: string) {
        const trip = await this.trips.findById(tripId);
        if (!trip) throw new NotFoundException('Trip not found');

        let conversation = await this.conversations.findByTripId(tripId);
        if (!conversation) {
            conversation = await this.conversations.save(this.conversations.create({ type: 'trip', trip: { id: tripId } as Trip }));
        }

        await this.syncTripParticipants(conversation.id, trip);
        return conversation;
    }

    private async ensureTripConversation(tripId: string, userId: string) {
        const trip = await this.trips.findById(tripId);
        if (!trip) throw new NotFoundException('Trip not found');
        await this.assertTripChatAccess(trip, userId);

        let conversation = await this.conversations.findByTripId(tripId);
        if (!conversation) {
            conversation = await this.conversations.save(this.conversations.create({ type: 'trip', trip: { id: tripId } as Trip }));
        }

        await this.syncTripParticipants(conversation.id, trip);
        return conversation;
    }

    private async assertTripChatAccess(trip: Trip, userId: string) {
        if (trip.organizerId === userId) return;

        const membership = await this.memberships.findByTripAndUser(trip.id, userId);
        if (!membership || membership.status !== 'active') throw new NotFoundException('Trip not found');
    }

    private async syncTripParticipants(conversationId: string, trip: Trip) {
        const activeMembers = await this.memberships.findActiveByTripId(trip.id);
        const allowedUserIds = new Set([trip.organizerId, ...activeMembers.map((member) => member.userId)]);

        const existing = await this.participants.findByConversationId(conversationId);
        const existingUserIds = new Set(existing.map((participant) => participant.userId));

        const toAdd = [...allowedUserIds].filter((id) => !existingUserIds.has(id));
        if (toAdd.length > 0) {
            await this.participants.save(toAdd.map((id) => this.participants.create({ conversation: { id: conversationId } as Conversation, userId: id })));
        }

        const toRemove = existing.filter((participant) => !allowedUserIds.has(participant.userId));
        if (toRemove.length > 0) await this.participants.remove(toRemove);
    }

    private async requireParticipant(conversationId: string, userId: string) {
        const participant = await this.participants.findByConversationAndUser(conversationId, userId);
        if (!participant) throw new NotFoundException('Conversation not found');
    }
}
