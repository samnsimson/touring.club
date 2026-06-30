import { useTripsStore } from '../../src/lib/trips-store';
import { mockTrips } from '@tc/mocks';

describe('useTripsStore', () => {
    beforeEach(() => {
        useTripsStore.setState({ trips: mockTrips, joinedTripIds: ['trip-1', 'trip-3'] });
    });

    it('joins a trip and increments its joined count', () => {
        const before = useTripsStore.getState().trips.find((trip) => trip.id === 'trip-5')?.joinedCount ?? 0;
        useTripsStore.getState().joinTrip('trip-5');
        const state = useTripsStore.getState();
        expect(state.joinedTripIds).toContain('trip-5');
        expect(state.trips.find((trip) => trip.id === 'trip-5')?.joinedCount).toBe(before + 1);
    });

    it('leaves a trip and decrements its joined count', () => {
        const before = useTripsStore.getState().trips.find((trip) => trip.id === 'trip-1')?.joinedCount ?? 0;
        useTripsStore.getState().leaveTrip('trip-1');
        const state = useTripsStore.getState();
        expect(state.joinedTripIds).not.toContain('trip-1');
        expect(state.trips.find((trip) => trip.id === 'trip-1')?.joinedCount).toBe(before - 1);
    });

    it('does not duplicate a trip already joined', () => {
        useTripsStore.getState().joinTrip('trip-1');
        const ids = useTripsStore.getState().joinedTripIds.filter((id) => id === 'trip-1');
        expect(ids).toHaveLength(1);
    });
});
