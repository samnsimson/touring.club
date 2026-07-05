import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthServiceApi } from '../apis/auth-service.api';
import { MessagingServiceApi } from '../apis/messaging-service.api';
import { NotificationsServiceApi } from '../apis/notifications-service.api';
import { TripsServiceApi } from '../apis/trips-service.api';
import { UsersServiceApi } from '../apis/users-service.api';
import { ApiClientUtils } from '../utils/api-client.utils';

@Injectable()
export class ApiClientService {
    public readonly auth: AuthServiceApi;
    public readonly users: UsersServiceApi;
    public readonly trips: TripsServiceApi;
    public readonly messaging: MessagingServiceApi;
    public readonly notifications: NotificationsServiceApi;

    constructor(config: ConfigService) {
        const baseUrl = ApiClientUtils.buildBaseUrl(config.getOrThrow('GATEWAY_BASE_URL'));
        this.auth = new AuthServiceApi({ baseUrl });
        this.users = new UsersServiceApi({ baseUrl });
        this.trips = new TripsServiceApi({ baseUrl });
        this.messaging = new MessagingServiceApi({ baseUrl });
        this.notifications = new NotificationsServiceApi({ baseUrl });
    }
}
