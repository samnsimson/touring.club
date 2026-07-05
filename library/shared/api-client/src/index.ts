export * from './contract/api-client.contract';
export * from './lib/api-client.module';
export * from './lib/api-client.service';
export * from './utils/api-client.utils';
export * as AuthApi from './clients/auth-service';
export * as TripsApi from './clients/trips-service';
export * as MessagingApi from './clients/messaging-service';
export * as NotificationsApi from './clients/notifications-service';

export { createClient as createAuthClient } from './clients/auth-service/client';
export { createClient as createTripsClient } from './clients/trips-service/client';
export { createClient as createMessagingClient } from './clients/messaging-service/client';
export { createClient as createNotificationsClient } from './clients/notifications-service/client';
