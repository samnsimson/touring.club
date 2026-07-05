import {
    ApiClientUtils,
    AuthApi,
    createAuthClient,
    createMessagingClient,
    createNotificationsClient,
    createTripsClient,
    createUsersClient,
    MessagingApi,
    NotificationsApi,
    TripsApi,
    UsersApi,
} from '@tc/api-client';

const baseUrl = ApiClientUtils.buildBaseUrl(process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? '');

export const apiClient = {
    auth: new AuthApi.AuthServiceApi({ client: createAuthClient({ baseUrl, throwOnError: true }) }),
    users: new UsersApi.UsersServiceApi({ client: createUsersClient({ baseUrl, throwOnError: true }) }),
    trips: new TripsApi.TripsServiceApi({ client: createTripsClient({ baseUrl, throwOnError: true }) }),
    messaging: new MessagingApi.MessagingServiceApi({ client: createMessagingClient({ baseUrl, throwOnError: true }) }),
    notifications: new NotificationsApi.NotificationsServiceApi({ client: createNotificationsClient({ baseUrl, throwOnError: true }) }),
};
