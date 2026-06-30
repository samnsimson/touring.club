import { create } from 'zustand';
import type { TripCategory } from '@tc/mocks';

export interface TripFiltersState {
    query: string;
    category: TripCategory | 'all';
    destination: string;
    setQuery: (query: string) => void;
    setCategory: (category: TripCategory | 'all') => void;
    setDestination: (destination: string) => void;
    reset: () => void;
}

const initialFilters = { query: '', category: 'all' as const, destination: '' };

export const useTripFiltersStore = create<TripFiltersState>((set) => ({
    ...initialFilters,
    setQuery: (query) => set({ query }),
    setCategory: (category) => set({ category }),
    setDestination: (destination) => set({ destination }),
    reset: () => set(initialFilters),
}));
