import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { NotificationType } from '@tc/database';
import { NotificationResponse } from './notification.dto';

export const NOTIFICATION_TYPES = ['trip_join_request', 'trip_approved', 'new_message', 'trip_update', 'organizer_announcement'] as const;

export class CreateNotificationDto {
    @ApiProperty({ example: 'usr_abc123' })
    @IsString()
    @MinLength(1)
    userId!: string;

    @ApiProperty({ example: 'trip_approved', enum: NOTIFICATION_TYPES })
    @IsString()
    @IsIn(NOTIFICATION_TYPES)
    type!: NotificationType;

    @ApiProperty({ example: 'Your trip request was approved' })
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    title!: string;

    @ApiProperty({ example: 'You can now view trip details.', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    body?: string;
}

export class CreateNotificationResponseDto {
    @ApiProperty({ type: NotificationResponse })
    notification!: NotificationResponse;
}
