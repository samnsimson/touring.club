import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository, Message, type DataSource } from '@tc/database';

@Injectable()
export class MessageRepository extends BaseRepository<Message> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        super(Message, dataSource);
    }

    findByConversationId(conversationId: string) {
        return this.find({ where: { conversationId }, order: { createdAt: 'ASC' } });
    }
}
