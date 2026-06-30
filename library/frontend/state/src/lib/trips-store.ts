import { create } from 'zustand';
import { mockTrips, type Trip } from '@tc/mocks';

export interface TripsState {
    trips: Trip[];
    joinedTripIds: string[];
    createTrip: (trip: Trip) => void;
    updateTrip: (id: string, changes: Partial<Trip>) => void;
    joinTrip: (tripId: string) => void;
    leaveTrip: (tripId: string) => void;
    isJoined: (tripId: string) => boolean;
}

export const useTripsStore = create<TripsState>((set, get) => ({
    trips: mockTrips,
    joinedTripIds: ['trip-1', 'trip-3'],
    createTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
    updateTrip: (id, changes) =>
        set((state) => ({
            trips: state.trips.map((trip) => (trip.id === id ? { ...trip, ...changes } : trip)),
        })),
    joinTrip: (tripId) =>
        set((state) => {
            if (state.joinedTripIds.includes(tripId)) return state;
            return {
                joinedTripIds: [...state.joinedTripIds, tripId],
                trips: state.trips.map((trip) => (trip.id === tripId ? { ...trip, joinedCount: trip.joinedCount + 1 } : trip)),
            };
        }),
    leaveTrip: (tripId) =>
        set((state) => ({
            joinedTripIds: state.joinedTripIds.filter((id) => id !== tripId),
            trips: state.trips.map((trip) => (trip.id === tripId ? { ...trip, joinedCount: Math.max(0, trip.joinedCount - 1) } : trip)),
        })),
    isJoined: (tripId) => get().joinedTripIds.includes(tripId),
}));
