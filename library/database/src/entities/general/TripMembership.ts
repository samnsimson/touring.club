import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { BaseEntity } from '../../lib/base.entity';
import { Trip } from './Trip';

export type TripMembershipStatus = 'pending' | 'active' | 'rejected' | 'left' | 'removed';

@Entity({ schema: 'general', name: 'trip_memberships' })
export class TripMembership extends BaseEntity {
    @ManyToOne(() => Trip, (trip) => trip.memberships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trip_id' })
    trip!: Trip;

    @RelationId((membership: TripMembership) => membership.trip)
    tripId!: string;

    @Column('text', { name: 'user_id' })
    userId!: string;

    @Column('text', { default: 'pending' })
    status!: TripMembershipStatus;
}
