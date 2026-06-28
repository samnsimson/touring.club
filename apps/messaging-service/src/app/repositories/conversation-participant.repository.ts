import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository, ConversationParticipant, type DataSource } from '@tc/database';

@Injectable()
export class ConversationParticipantRepository extends BaseRepository<ConversationParticipant> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        super(ConversationParticipant, dataSource);
    }

    findByConversationAndUser(conversationId: string, userId: string) {
        return this.findOne({ where: { conversation: { id: conversationId }, userId } });
    }

    findByConversationId(conversationId: string) {
        return this.find({ where: { conversation: { id: conversationId } } });
    }
}
