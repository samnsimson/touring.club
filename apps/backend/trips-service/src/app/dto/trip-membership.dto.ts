import { ApiProperty } from '@nestjs/swagger';
import { TripMembership, type TripMembershipStatus } from '@tc/database';

export type TripMembershipResponseInit = Pick<TripMembershipResponse, 'id' | 'tripId' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>;

export class TripMembershipResponse {
    @ApiProperty({ example: 'membership_abc123' })
    id!: string;

    @ApiProperty({ example: 'trip_abc123' })
    tripId!: string;

    @ApiProperty({ example: 'usr_abc123' })
    userId!: string;

    @ApiProperty({ example: 'active', enum: ['pending', 'active', 'rejected', 'left', 'removed'] })
    status!: TripMembershipStatus;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    constructor(data: TripMembershipResponseInit) {
        Object.assign(this, data);
    }

    static from(membership: TripMembership): TripMembershipResponse {
        return new TripMembershipResponse({
            id: membership.id,
            tripId: membership.tripId,
            userId: membership.userId,
            status: membership.status,
            createdAt: membership.createdAt,
            updatedAt: membership.updatedAt,
        });
    }
}

export class JoinTripResponseDto {
    @ApiProperty({ type: TripMembershipResponse })
    membership!: TripMembershipResponse;
}

export class LeaveTripResponseDto {
    @ApiProperty({ type: TripMembershipResponse })
    membership!: TripMembershipResponse;
}

export class ListTripMembersResponseDto {
    @ApiProperty({ type: [TripMembershipResponse] })
    members!: TripMembershipResponse[];
}

export class TripMembershipActionResponseDto {
    @ApiProperty({ type: TripMembershipResponse })
    membership!: TripMembershipResponse;
}
