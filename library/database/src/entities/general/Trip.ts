import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../lib/base.entity';
import { Conversation } from './Conversation';
import { TripMembership } from './TripMembership';

export type TripVisibility = 'public' | 'private';
export type TripStatus = 'draft' | 'published' | 'cancelled' | 'archived';

@Entity({ schema: 'general', name: 'trips' })
export class Trip extends BaseEntity {
    @Column('text', { name: 'organizer_id' })
    organizerId!: string;

    @Column('text')
    title!: string;

    @Column('text', { nullable: true })
    description: string | null = null;

    @Column('text')
    destination!: string;

    @Column('text', { name: 'meeting_location', nullable: true })
    meetingLocation: string | null = null;

    @Column('timestamptz', { name: 'start_date' })
    startDate!: Date;

    @Column('timestamptz', { name: 'end_date' })
    endDate!: Date;

    @Column('int')
    capacity!: number;

    @Column('text', { default: 'private' })
    visibility!: TripVisibility;

    @Column('text', { default: 'draft' })
    status!: TripStatus;

    @Column('text', { name: 'cover_image_urls', array: true, default: () => "'{}'" })
    coverImageUrls!: string[];

    @Column('text', { array: true, default: () => "'{}'" })
    categories!: string[];

    @Column('text', { array: true, default: () => "'{}'" })
    tags!: string[];

    @OneToMany(() => TripMembership, (membership) => membership.trip)
    memberships!: TripMembership[];

    @OneToMany(() => Conversation, (conversation) => conversation.trip)
    conversations!: Conversation[];
}
