import { Injectable, Logger } from '@nestjs/common';
import { ServerApi } from '@tc/server-api';

export type TripSystemEventType = 'member_joined' | 'join_requested' | 'member_left' | 'member_approved' | 'member_removed';

export type PostTripSystemEventPayload = {
    event: TripSystemEventType;
    actorUserId: string;
    subjectUserId: string;
};

@Injectable()
export class MessagingClient {
    private readonly logger = new Logger(MessagingClient.name);

    constructor(private readonly serverApi: ServerApi) {}

    async postTripSystemEvent(tripId: string, payload: PostTripSystemEventPayload, authorization: string): Promise<void> {
        try {
            await this.serverApi.messagingService.postTripSystemEvent({
                path: { tripId },
                body: payload,
                headers: { Authorization: authorization },
            });
        } catch (error) {
            this.logger.warn(`Failed to post trip system event for trip ${tripId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
