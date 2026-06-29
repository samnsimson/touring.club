import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { BaseEntity } from '../../lib/base.entity';
import { Conversation } from './Conversation';

@Entity({ schema: 'general', name: 'conversation_participants' })
export class ConversationParticipant extends BaseEntity {
    @ManyToOne(() => Conversation, (conversation) => conversation.participants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation!: Conversation;

    @RelationId((participant: ConversationParticipant) => participant.conversation)
    conversationId!: string;

    @Column('text', { name: 'user_id' })
    userId!: string;
}
