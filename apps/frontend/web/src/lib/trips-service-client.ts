import { clientApi } from './client-api';

const tripsServiceSdk = clientApi.tripsService;

export const discoverTrips = tripsServiceSdk.discoverTrips.bind(tripsServiceSdk);
export const getPublicTrip = tripsServiceSdk.getPublicTrip.bind(tripsServiceSdk);
export const joinTrip = tripsServiceSdk.joinTrip.bind(tripsServiceSdk);
export const leaveTrip = tripsServiceSdk.leaveTrip.bind(tripsServiceSdk);
export const listMyTrips = tripsServiceSdk.listMyTrips.bind(tripsServiceSdk);
