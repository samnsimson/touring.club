import { configureTripsServiceClient, TripsServiceSdk } from '@tc/client-api/services/trips-service';

configureTripsServiceClient({ baseUrl: `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1` });

const tripsServiceSdk = new TripsServiceSdk();

export const discoverTrips = tripsServiceSdk.discoverTrips.bind(tripsServiceSdk);
export const getPublicTrip = tripsServiceSdk.getPublicTrip.bind(tripsServiceSdk);
export const joinTrip = tripsServiceSdk.joinTrip.bind(tripsServiceSdk);
export const leaveTrip = tripsServiceSdk.leaveTrip.bind(tripsServiceSdk);
export const listMyTrips = tripsServiceSdk.listMyTrips.bind(tripsServiceSdk);
