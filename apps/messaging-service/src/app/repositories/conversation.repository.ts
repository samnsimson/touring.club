import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository, Conversation, ConversationParticipant, type DataSource } from '@tc/database';

@Injectable()
export class ConversationRepository extends BaseRepository<Conversation> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        super(Conversation, dataSource);
    }

    findDirectBetweenUsers(userId: string, otherUserId: string) {
        return this.createQueryBuilder('conversation')
            .innerJoin(ConversationParticipant, 'participant_a', 'participant_a.conversationId = conversation.id')
            .innerJoin(ConversationParticipant, 'participant_b', 'participant_b.conversationId = conversation.id')
            .where('conversation.type = :type', { type: 'direct' })
            .andWhere('participant_a.userId = :userId', { userId })
            .andWhere('participant_b.userId = :otherUserId', { otherUserId })
            .getOne();
    }

    findForUser(userId: string) {
        return this.createQueryBuilder('conversation')
            .innerJoin(ConversationParticipant, 'participant', 'participant.conversationId = conversation.id')
            .where('participant.userId = :userId', { userId })
            .orderBy('conversation.updatedAt', 'DESC')
            .getMany();
    }
}
