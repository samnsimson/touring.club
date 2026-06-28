import { Injectable, Logger } from '@nestjs/common';
import { HttpClient } from '@tc/common';
import { ConfigService } from '@tc/config';

export type TripSystemEventType = 'member_joined' | 'join_requested' | 'member_left' | 'member_approved' | 'member_removed';

export type PostTripSystemEventPayload = {
    event: TripSystemEventType;
    actorUserId: string;
    subjectUserId: string;
};

@Injectable()
export class MessagingClient {
    private readonly logger = new Logger(MessagingClient.name);

    constructor(
        private readonly config: ConfigService,
        private readonly http: HttpClient,
    ) {}

    async postTripSystemEvent(tripId: string, payload: PostTripSystemEventPayload): Promise<void> {
        const baseUrl = this.config.get('MESSAGING_SERVICE_URL');
        try {
            const url = `${baseUrl}/api/v1/conversations/internal/trips/${encodeURIComponent(tripId)}/system-events`;
            await this.http.post(url, payload);
        } catch (error) {
            this.logger.warn(`Failed to post trip system event for trip ${tripId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
