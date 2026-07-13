import NextLink from 'next/link';
import { Container, PageHeader, Pill, SimpleGrid, Stack, Text, TripCard } from '@tc/ui';
import { discoverTrips } from '@/lib/trips-service-client';

export const metadata = {
    title: 'Discover trips — touring.club',
};

export default async function TripsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const { category } = await searchParams;
    const { data } = await discoverTrips({});
    const trips = data?.trips ?? [];
    const categories = [...new Set(trips.flatMap((trip) => trip.categories))].sort();
    const filteredTrips = category ? trips.filter((trip) => trip.categories.includes(category)) : trips;

    return (
        <Container maxW="7xl" py="10">
            <PageHeader title="Discover trips" description="Browse group trips, tours, and adventures organized by travelers like you." />
            {categories.length > 0 ? (
                <Stack direction="row" gap="3" wrap="wrap" mb="8">
                    <Pill colorPalette={category ? 'gray' : 'orange'} variant={category ? 'surface' : 'subtle'}>
                        <NextLink href="/trips">All</NextLink>
                    </Pill>
                    {categories.map((tripCategory) => (
                        <Pill
                            key={tripCategory}
                            colorPalette={category === tripCategory ? 'orange' : 'teal'}
                            variant={category === tripCategory ? 'subtle' : 'surface'}
                        >
                            <NextLink href={`/trips?category=${encodeURIComponent(tripCategory)}`}>{tripCategory}</NextLink>
                        </Pill>
                    ))}
                </Stack>
            ) : null}
            {filteredTrips.length > 0 ? (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="6">
                    {filteredTrips.map((trip) => (
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
                <Text color="gray.600">No published trips yet — check back soon.</Text>
            )}
        </Container>
    );
}
