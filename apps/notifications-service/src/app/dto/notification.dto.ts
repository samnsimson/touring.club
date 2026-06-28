import { ApiProperty } from '@nestjs/swagger';
import { Notification, type NotificationType } from '@tc/database';

export type NotificationResponseInit = Pick<NotificationResponse, 'id' | 'type' | 'title' | 'body' | 'readAt' | 'createdAt' | 'updatedAt'>;

export class NotificationResponse {
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

    constructor(data: NotificationResponseInit) {
        Object.assign(this, data);
    }

    static from(notification: Notification): NotificationResponse {
        return new NotificationResponse({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        });
    }
}

export class ListNotificationsResponseDto {
    @ApiProperty({ type: [NotificationResponse] })
    notifications!: NotificationResponse[];
}

export class MarkNotificationReadResponseDto {
    @ApiProperty({ type: NotificationResponse })
    notification!: NotificationResponse;
}
