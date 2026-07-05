import { Injectable, Logger } from '@nestjs/common';
import { NotificationsServiceApi } from '@tc/api-client';
import { ConfigService } from '@tc/config';
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
    private readonly api: NotificationsServiceApi;

    constructor(private readonly config: ConfigService) {
        this.api = new NotificationsServiceApi({ baseUrl: `${this.config.get('NOTIFICATIONS_SERVICE_URL')}/api/v1` });
    }

    async createNotification(payload: CreateNotificationPayload, authorization: string): Promise<void> {
        try {
            await this.api.createNotification({
                body: payload,
                headers: { Authorization: authorization },
            });
        } catch (error) {
            this.logger.warn(`Failed to create notification for user ${payload.userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
