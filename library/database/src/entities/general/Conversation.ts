import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../lib/base.entity';

export type ConversationType = 'direct' | 'group' | 'trip';

@Entity({ schema: 'general', name: 'conversations' })
export class Conversation extends BaseEntity {
    @Column('text')
    type!: ConversationType;

    @Column('uuid', { name: 'trip_id', nullable: true })
    tripId: string | null = null;
}
