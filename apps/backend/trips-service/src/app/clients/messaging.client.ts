import { Injectable, Logger } from '@nestjs/common';
import { MessagingServiceApi } from '@tc/server-api';
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
    private readonly api: MessagingServiceApi;

    constructor(private readonly config: ConfigService) {
        this.api = new MessagingServiceApi({ baseUrl: this.config.get('MESSAGING_SERVICE_URL') });
    }

    async postTripSystemEvent(tripId: string, payload: PostTripSystemEventPayload, authorization: string): Promise<void> {
        try {
            await this.api.postTripSystemEvent({
                path: { tripId },
                body: payload,
                headers: { Authorization: authorization },
            });
        } catch (error) {
            this.logger.warn(`Failed to post trip system event for trip ${tripId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
