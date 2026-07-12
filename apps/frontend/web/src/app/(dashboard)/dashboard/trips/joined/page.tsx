import { Compass } from 'lucide-react';
import { AppEmptyState, PageHeader, SimpleGrid, TripCard } from '@tc/ui';
import { discoverTrips } from '@/lib/trips-service-client';

export const metadata = {
    title: 'Joined trips — touring.club',
};

export default async function JoinedTripsPage() {
    // trips-service has no "my joined trips" endpoint yet (only organizer-owned `listMyTrips` and public
    // `discoverTrips`) — stand in with a few public trips until trip membership is queryable per-user.
    const { data } = await discoverTrips({});
    const trips = (data?.trips ?? []).slice(0, 3);

    return (
        <>
            <PageHeader title="Joined trips" description="Trips you've requested to join or been approved for." />
            {trips.length > 0 ? (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="6">
                    {trips.map((trip) => (
                        <TripCard
                            key={trip.id}
                            href={`/trips/${trip.id}`}
                            title={trip.title}
                            destination={trip.destination}
                            coverImageUrl={trip.coverImageUrls[0]}
                            startDate={trip.startDate}
                            endDate={trip.endDate}
                            capacity={trip.capacity}
                            categories={trip.categories}
                        />
                    ))}
                </SimpleGrid>
            ) : (
                <AppEmptyState icon={<Compass size={32} />} title="You haven't joined any trips yet" description="Browse trips and request to join one." />
            )}
        </>
    );
}
