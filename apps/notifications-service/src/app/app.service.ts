import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification } from '@tc/database';
import { NotificationRepository } from './repositories';

@Injectable()
export class AppService {
    constructor(private readonly notifications: NotificationRepository) {}

    async listNotifications(userId: string) {
        const notifications = await this.notifications.findByUserId(userId);
        return { notifications: notifications.map((notification) => this.toNotificationDto(notification)) };
    }

    async markNotificationRead(userId: string, notificationId: string) {
        const notification = await this.notifications.findByIdAndUserId(notificationId, userId);
        if (!notification) throw new NotFoundException('Notification not found');

        if (!notification.readAt) {
            notification.readAt = new Date();
            await this.notifications.save(notification);
        }

        return { notification: this.toNotificationDto(notification) };
    }

    private toNotificationDto(notification: Notification) {
        return {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        };
    }
}
