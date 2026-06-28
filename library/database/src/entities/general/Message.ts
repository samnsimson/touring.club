import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../lib/base.entity';

export type MessageType = 'text' | 'image' | 'file' | 'system';

@Entity({ schema: 'general', name: 'messages' })
export class Message extends BaseEntity {
    @Column('uuid', { name: 'conversation_id' })
    conversationId!: string;

    @Column('text', { name: 'sender_id' })
    senderId!: string;

    @Column('text', { default: 'text' })
    messageType!: MessageType;

    @Column('text')
    body: string;
}
