import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../lib/base.entity';

@Entity({ schema: 'general', name: 'conversation_participants' })
export class ConversationParticipant extends BaseEntity {
    @Column('uuid', { name: 'conversation_id' })
    conversationId!: string;

    @Column('text', { name: 'user_id' })
    userId!: string;
}
