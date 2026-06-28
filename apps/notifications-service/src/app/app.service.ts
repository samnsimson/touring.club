import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './repositories';
import { NotificationResponse } from './dto';

@Injectable()
export class AppService {
    constructor(private readonly notifications: NotificationRepository) {}

    async listNotifications(userId: string) {
        const notifications = await this.notifications.findByUserId(userId);
        return { notifications: notifications.map((notification) => NotificationResponse.from(notification)) };
    }

    async markNotificationRead(userId: string, notificationId: string) {
        const notification = await this.notifications.findByIdAndUserId(notificationId, userId);
        if (!notification) throw new NotFoundException('Notification not found');
        if (!notification.readAt) {
            notification.readAt = new Date();
            await this.notifications.save(notification);
        }
        return { notification: NotificationResponse.from(notification) };
    }
}
