import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../lib/base.entity';

export type TripMembershipStatus = 'pending' | 'active' | 'rejected' | 'left' | 'removed';

@Entity({ schema: 'general', name: 'trip_memberships' })
export class TripMembership extends BaseEntity {
    @Column('uuid', { name: 'trip_id' })
    tripId!: string;

    @Column('text', { name: 'user_id' })
    userId!: string;

    @Column('text', { default: 'pending' })
    status!: TripMembershipStatus;
}
