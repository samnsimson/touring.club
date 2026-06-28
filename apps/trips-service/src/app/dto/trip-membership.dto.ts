import { ApiProperty } from '@nestjs/swagger';
import type { TripMembershipStatus } from '@tc/database';

export class TripMembershipDto {
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
}

export class JoinTripResponseDto {
    @ApiProperty({ type: TripMembershipDto })
    membership!: TripMembershipDto;
}

export class LeaveTripResponseDto {
    @ApiProperty({ type: TripMembershipDto })
    membership!: TripMembershipDto;
}

export class ListTripMembersResponseDto {
    @ApiProperty({ type: [TripMembershipDto] })
    members!: TripMembershipDto[];
}

export class TripMembershipActionResponseDto {
    @ApiProperty({ type: TripMembershipDto })
    membership!: TripMembershipDto;
}
