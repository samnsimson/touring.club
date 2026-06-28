import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './repositories';
import { CreateNotificationDto, NotificationResponse } from './dto';
import { NotificationsGateway } from './gateways';

@Injectable()
export class AppService {
    constructor(
        private readonly notifications: NotificationRepository,
        private readonly gateway: NotificationsGateway,
    ) {}

    async listNotifications(userId: string) {
        const notifications = await this.notifications.findByUserId(userId);
        return { notifications: notifications.map((notification) => NotificationResponse.from(notification)) };
    }

    async createNotification(dto: CreateNotificationDto) {
        const notification = await this.notifications.save(
            this.notifications.create({ userId: dto.userId, type: dto.type, title: dto.title, body: dto.body ?? null }),
        );
        const response = NotificationResponse.from(notification);
        this.gateway.emitNotificationCreated(dto.userId, response);
        return { notification: response };
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
