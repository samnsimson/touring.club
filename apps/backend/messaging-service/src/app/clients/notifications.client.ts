import { Injectable, Logger } from '@nestjs/common';
import { HttpClient } from '@tc/common';
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

    constructor(
        private readonly config: ConfigService,
        private readonly http: HttpClient,
    ) {}

    async createNotification(payload: CreateNotificationPayload, authorization: string): Promise<void> {
        const baseUrl = this.config.get('NOTIFICATIONS_SERVICE_URL');
        try {
            const url = `${baseUrl}/api/v1/notifications/internal`;
            await this.http.post(url, payload, { headers: { Authorization: authorization } });
        } catch (error) {
            this.logger.warn(`Failed to create notification for user ${payload.userId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
