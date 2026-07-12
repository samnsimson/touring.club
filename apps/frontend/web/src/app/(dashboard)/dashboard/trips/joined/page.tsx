import { Compass } from 'lucide-react';
import { AppEmptyState, PageHeader, SimpleGrid, TripCard } from '@tc/ui';
import { currentUser, mockTrips } from '@tc/mocks';

export const metadata = {
    title: 'Joined trips — touring.club',
};

export default function JoinedTripsPage() {
    // @tc/mocks has no TripMembership fixtures yet — stand in with a few trips currentUser doesn't organize.
    const trips = mockTrips.filter((trip) => trip.status === 'published' && trip.organizerId !== currentUser.id).slice(0, 3);

    return (
        <>
            <PageHeader title="Joined trips" description="Trips you've requested to join or been approved for." />
            {trips.length > 0 ? (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="6">
                    {trips.map((trip) => (
                        <TripCard
                            key={trip.id}
                            href={`/trips/${trip.slug}`}
                            title={trip.title}
                            destination={trip.destination}
                            coverImageUrl={trip.coverImageUrl}
                            startDate={trip.startDate}
                            endDate={trip.endDate}
                            capacity={trip.capacity}
                            joinedCount={trip.joinedCount}
                            difficulty={trip.difficulty}
                            categories={trip.categories}
                            priceLabel={trip.priceLabel}
                        />
                    ))}
                </SimpleGrid>
            ) : (
                <AppEmptyState icon={<Compass size={32} />} title="You haven't joined any trips yet" description="Browse trips and request to join one." />
            )}
        </>
    );
}
