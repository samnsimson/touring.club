import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { BaseEntity } from '../../lib/base.entity';
import { Conversation } from './Conversation';

export type MessageType = 'text' | 'image' | 'file' | 'system';

@Entity({ schema: 'general', name: 'messages' })
export class Message extends BaseEntity {
    @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation!: Conversation;

    @RelationId((message: Message) => message.conversation)
    conversationId!: string;

    @Column('text', { name: 'sender_id' })
    senderId!: string;

    @Column('text', { default: 'text' })
    messageType!: MessageType;

    @Column('text')
    body!: string;
}
