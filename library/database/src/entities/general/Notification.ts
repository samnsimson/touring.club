import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../lib/base.entity';

export type NotificationType = 'trip_join_request' | 'trip_approved' | 'new_message' | 'trip_update' | 'organizer_announcement';

@Entity({ schema: 'general', name: 'notifications' })
export class Notification extends BaseEntity {
    @Column('text', { name: 'user_id' })
    userId!: string;

    @Column('text')
    type!: NotificationType;

    @Column('text')
    title!: string;

    @Column('text', { nullable: true })
    body: string | null = null;

    @Column('timestamptz', { name: 'read_at', nullable: true })
    readAt: Date | null = null;
}
