import { ApiProperty } from '@nestjs/swagger';
import type { NotificationType } from '@tc/database';

export class NotificationDto {
    @ApiProperty({ example: 'notification_abc123' })
    id!: string;

    @ApiProperty({ example: 'trip_approved', enum: ['trip_join_request', 'trip_approved', 'new_message', 'trip_update', 'organizer_announcement'] })
    type!: NotificationType;

    @ApiProperty({ example: 'Your trip request was approved' })
    title!: string;

    @ApiProperty({ example: 'You can now view trip details.', nullable: true })
    body!: string | null;

    @ApiProperty({ example: null, nullable: true })
    readAt!: Date | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class ListNotificationsResponseDto {
    @ApiProperty({ type: [NotificationDto] })
    notifications!: NotificationDto[];
}

export class MarkNotificationReadResponseDto {
    @ApiProperty({ type: NotificationDto })
    notification!: NotificationDto;
}
