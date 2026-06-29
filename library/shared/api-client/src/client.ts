import { Sdk as AuthSdk } from './lib/auth-service-client';
import { Sdk as UsersSdk } from './lib/users-service-client';
import { Sdk as TripsSdk } from './lib/trips-service-client';
import { Sdk as MessagingSdk } from './lib/messaging-service-client';
import { Sdk as NotificationsSdk } from './lib/notifications-service-client';

import { createClient as createAuthClient } from './lib/auth-service-client/client';
import { createClient as createUsersClient } from './lib/users-service-client/client';
import { createClient as createTripsClient } from './lib/trips-service-client/client';
import { createClient as createMessagingClient } from './lib/messaging-service-client/client';
import { createClient as createNotificationsClient } from './lib/notifications-service-client/client';

export interface ApiClientConfig {
    baseUrl?: string;
}

export class ApiClient {
    private readonly authSdk: AuthSdk;
    private readonly usersSdk: UsersSdk;
    private readonly tripsSdk: TripsSdk;
    private readonly messagingSdk: MessagingSdk;
    private readonly notificationsSdk: NotificationsSdk;

    constructor(config: ApiClientConfig = {}) {
        this.authSdk = new AuthSdk({ client: createAuthClient({ baseUrl: config.baseUrl }) });
        this.usersSdk = new UsersSdk({ client: createUsersClient({ baseUrl: config.baseUrl }) });
        this.tripsSdk = new TripsSdk({ client: createTripsClient({ baseUrl: config.baseUrl }) });
        this.messagingSdk = new MessagingSdk({ client: createMessagingClient({ baseUrl: config.baseUrl }) });
        this.notificationsSdk = new NotificationsSdk({ client: createNotificationsClient({ baseUrl: config.baseUrl }) });
    }

    get authClient() {
        return this.authSdk;
    }

    get usersClient() {
        return this.usersSdk;
    }

    get tripsClient() {
        return this.tripsSdk;
    }

    get messagingClient() {
        return this.messagingSdk;
    }

    get notificationsClient() {
        return this.notificationsSdk;
    }
}
