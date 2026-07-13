import NextLink from 'next/link';
import { Compass } from 'lucide-react';
import { AppEmptyState, Button, PageHeader, SimpleGrid, TripCard } from '@tc/ui';
import { auth } from '@/auth';
import { listMyTrips } from '@/lib/trips-service-client';

export const metadata = {
    title: 'My trips — touring.club',
};

export default async function MyTripsPage() {
    const session = await auth();
    const accessToken = session?.user?.accessToken;
    const { data } = accessToken ? await listMyTrips({ headers: { Authorization: `Bearer ${accessToken}` } }) : { data: undefined };
    const trips = data?.trips ?? [];

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
            {!accessToken ? (
                <AppEmptyState title="Sign in to see your trips" description="Sign in to view and manage the trips you're organizing." />
            ) : trips.length > 0 ? (
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
                <AppEmptyState
                    icon={<Compass size={32} />}
                    title="You haven't organized any trips yet"
                    description="Create your first trip and start building your travel community."
                />
            )}
        </>
    );
}
