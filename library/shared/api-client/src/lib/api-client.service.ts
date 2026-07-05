import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthServiceApi } from '../clients/auth-service';
import { createClient as createAuthClient } from '../clients/auth-service/client';
import { MessagingServiceApi } from '../clients/messaging-service';
import { createClient as createMessagingClient } from '../clients/messaging-service/client';
import { NotificationsServiceApi } from '../clients/notifications-service';
import { createClient as createNotificationsClient } from '../clients/notifications-service/client';
import { TripsServiceApi } from '../clients/trips-service';
import { createClient as createTripsClient } from '../clients/trips-service/client';
import { ApiClientUtils } from '../utils/api-client.utils';

@Injectable()
export class ApiClientService {
    public readonly auth: AuthServiceApi;
    public readonly trips: TripsServiceApi;
    public readonly messaging: MessagingServiceApi;
    public readonly notifications: NotificationsServiceApi;

    constructor(config: ConfigService) {
        const baseUrl = ApiClientUtils.buildBaseUrl(config.getOrThrow('GATEWAY_BASE_URL'));
        this.auth = new AuthServiceApi({ client: createAuthClient({ baseUrl, throwOnError: true }) });
        this.trips = new TripsServiceApi({ client: createTripsClient({ baseUrl, throwOnError: true }) });
        this.messaging = new MessagingServiceApi({ client: createMessagingClient({ baseUrl, throwOnError: true }) });
        this.notifications = new NotificationsServiceApi({ client: createNotificationsClient({ baseUrl, throwOnError: true }) });
    }
}
