import NextLink from 'next/link';
import { Compass } from 'lucide-react';
import { AppEmptyState, Button, PageHeader, SimpleGrid, TripCard } from '@tc/ui';
import { currentUser, getTripsByOrganizer } from '@tc/mocks';

export const metadata = {
    title: 'My trips — touring.club',
};

export default function MyTripsPage() {
    const trips = getTripsByOrganizer(currentUser.id);

    return (
        <>
            <PageHeader
                title="My trips"
                description="Trips you're organizing."
                actions={
                    <Button asChild colorPalette="orange">
                        <NextLink href="/trips">Browse trips for inspiration</NextLink>
                    </Button>
                }
            />
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
                <AppEmptyState
                    icon={<Compass size={32} />}
                    title="You haven't organized any trips yet"
                    description="Create your first trip and start building your travel community."
                />
            )}
        </>
    );
}
