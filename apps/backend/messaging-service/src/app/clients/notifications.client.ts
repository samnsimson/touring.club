import { Injectable, Logger } from '@nestjs/common';
import { ServerApi } from '@tc/server-api';
import type { NotificationType } from '@tc/database';

export type CreateNotificationPayload = {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string;
};

@Injectable()
export class NotificationsClient {
    private readonly logger = new Logger(NotificationsClient.name);

    constructor(private readonly serverApi: ServerApi) {}

    async createNotification(payload: CreateNotificationPayload, authorization: string): Promise<void> {
        try {
            await this.serverApi.notificationsService.createNotification({
                body: payload,
                headers: { Authorization: authorization },
            });
        } catch (error) {
            this.logger.warn(`Failed to create notification for user ${payload.userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
