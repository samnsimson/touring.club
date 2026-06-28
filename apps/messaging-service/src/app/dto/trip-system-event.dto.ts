import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';
import { MessageResponse, type SendMessageResponseDto } from './message.dto';

export const TRIP_SYSTEM_EVENT_TYPES = ['member_joined', 'join_requested', 'member_left', 'member_approved', 'member_removed'] as const;

export type TripSystemEventType = (typeof TRIP_SYSTEM_EVENT_TYPES)[number];

export class PostTripSystemEventDto {
    @ApiProperty({ example: 'member_joined', enum: TRIP_SYSTEM_EVENT_TYPES })
    @IsString()
    @IsIn(TRIP_SYSTEM_EVENT_TYPES)
    event!: TripSystemEventType;

    @ApiProperty({ example: 'usr_abc123' })
    @IsString()
    @MinLength(1)
    actorUserId!: string;

    @ApiProperty({ example: 'usr_def456' })
    @IsString()
    @MinLength(1)
    subjectUserId!: string;
}

export class PostTripSystemEventResponseDto implements SendMessageResponseDto {
    @ApiProperty({ type: MessageResponse })
    message!: MessageResponse;
}
