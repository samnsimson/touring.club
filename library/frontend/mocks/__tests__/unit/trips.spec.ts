import { getTripBySlug, getTripsByOrganizer, mockTrips } from '../../src/lib/trips';
import type { Trip } from '../../src/lib/types';

describe('trips mock data', () => {
    it('exposes a non-empty list of trips', () => {
        expect(mockTrips.length).toBeGreaterThan(0);
    });

    it('finds a trip by slug', () => {
        const trip = getTripBySlug(mockTrips[0].slug);
        expect(trip?.id).toBe(mockTrips[0].id);
    });

    it('returns undefined for an unknown slug', () => {
        expect(getTripBySlug('does-not-exist')).toBeUndefined();
    });

    it('filters trips by organizer', () => {
        const organizerId = mockTrips[0].organizerId;
        const trips = getTripsByOrganizer(organizerId);
        expect(trips.every((trip: Trip) => trip.organizerId === organizerId)).toBe(true);
    });
});
