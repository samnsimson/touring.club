import { configureTripsServiceClient } from '@tc/client-api/services/trips-service';

configureTripsServiceClient({ baseUrl: `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1` });

export { discoverTrips, getPublicTrip, joinTrip, leaveTrip, listMyTrips } from '@tc/client-api/services/trips-service';
