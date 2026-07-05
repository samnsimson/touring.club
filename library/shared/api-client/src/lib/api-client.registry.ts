export const SERVICE_REGISTRY = [
    { name: 'auth-service', endpoint: process.env.AUTH_SERVICE_URL },
    { name: 'users-service', endpoint: process.env.USER_SERVICE_URL },
    { name: 'trips-service', endpoint: process.env.TRIPS_SERVICE_URL },
    { name: 'messaging-service', endpoint: process.env.MESSAGING_SERVICE_URL },
    { name: 'notifications-service', endpoint: process.env.NOTIFICATIONS_SERVICE_URL },
];
