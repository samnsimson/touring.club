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

import { baseClientConfig } from './utils/client.utils';
import { ApiClientConfig } from './contract/client.contract';

export class ApiClient {
    public readonly authClient: AuthSdk;
    public readonly usersClient: UsersSdk;
    public readonly tripsClient: TripsSdk;
    public readonly messagingClient: MessagingSdk;
    public readonly notificationsClient: NotificationsSdk;

    constructor(config: ApiClientConfig = {}) {
        this.authClient = new AuthSdk({ client: createAuthClient(baseClientConfig(config)) });
        this.usersClient = new UsersSdk({ client: createUsersClient(baseClientConfig(config)) });
        this.tripsClient = new TripsSdk({ client: createTripsClient(baseClientConfig(config)) });
        this.messagingClient = new MessagingSdk({ client: createMessagingClient(baseClientConfig(config)) });
        this.notificationsClient = new NotificationsSdk({ client: createNotificationsClient(baseClientConfig(config)) });
    }
}
