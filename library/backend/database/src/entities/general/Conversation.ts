import { Column, Entity, JoinColumn, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { BaseEntity } from '../../lib/base.entity';
import { ConversationParticipant } from './ConversationParticipant';
import { Message } from './Message';
import { Trip } from './Trip';

export type ConversationType = 'direct' | 'group' | 'trip';

@Entity({ schema: 'general', name: 'conversations' })
export class Conversation extends BaseEntity {
    @Column('text')
    type!: ConversationType;

    @ManyToOne(() => Trip, (trip) => trip.conversations, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'trip_id' })
    trip: Trip | null = null;

    @RelationId((conversation: Conversation) => conversation.trip)
    tripId: string | null = null;

    @OneToMany(() => ConversationParticipant, (participant) => participant.conversation)
    participants!: ConversationParticipant[];

    @OneToMany(() => Message, (message) => message.conversation)
    messages!: Message[];
}
