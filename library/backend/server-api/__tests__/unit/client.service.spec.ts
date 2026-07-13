import { ConfigService } from '@nestjs/config';
import { AuthServiceSdk } from '@tc/api-sdk/clients/auth-service';
import { UsersServiceSdk } from '@tc/api-sdk/clients/users-service';
import { TripsServiceSdk } from '@tc/api-sdk/clients/trips-service';
import { MessagingServiceSdk } from '@tc/api-sdk/clients/messaging-service';
import { NotificationsServiceSdk } from '@tc/api-sdk/clients/notifications-service';
import { ServerApi } from '../../src/client.service';

describe('ServerApi', () => {
    const env: Record<string, string> = {
        AUTH_SERVICE_URL: 'http://auth.local/api/v1',
        USERS_SERVICE_URL: 'http://users.local/api/v1',
        TRIPS_SERVICE_URL: 'http://trips.local/api/v1',
        MESSAGING_SERVICE_URL: 'http://messaging.local/api/v1',
        NOTIFICATIONS_SERVICE_URL: 'http://notifications.local/api/v1',
    };
    const configService = { get: (key: string) => env[key] } as ConfigService;
    const serverApi = new ServerApi(configService);

    it.each([
        ['authService', AuthServiceSdk],
        ['usersService', UsersServiceSdk],
        ['tripsService', TripsServiceSdk],
        ['messagingService', MessagingServiceSdk],
        ['notificationsService', NotificationsServiceSdk],
    ] as const)('%s builds its own service SDK instance', (getter, sdkClass) => {
        expect(serverApi[getter]).toBeInstanceOf(sdkClass);
    });
});
