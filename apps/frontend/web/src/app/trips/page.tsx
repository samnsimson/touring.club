import NextLink from 'next/link';
import { Container, PageHeader, Pill, SimpleGrid, Stack, TripCard } from '@tc/ui';
import { mockTrips, tripCategories } from '@tc/mocks';

export const metadata = {
    title: 'Discover trips — touring.club',
};

export default async function TripsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const { category } = await searchParams;
    const trips = mockTrips.filter((trip) => trip.status === 'published' && (!category || trip.categories.includes(category as never)));

    return (
        <Container maxW="7xl" py="10">
            <PageHeader title="Discover trips" description="Browse group trips, tours, and adventures organized by travelers like you." />
            <Stack direction="row" gap="3" wrap="wrap" mb="8">
                <Pill colorPalette={category ? 'gray' : 'orange'} variant={category ? 'surface' : 'subtle'}>
                    <NextLink href="/trips">All</NextLink>
                </Pill>
                {tripCategories.map((tripCategory) => (
                    <Pill
                        key={tripCategory}
                        colorPalette={category === tripCategory ? 'orange' : 'teal'}
                        variant={category === tripCategory ? 'subtle' : 'surface'}
                    >
                        <NextLink href={`/trips?category=${encodeURIComponent(tripCategory)}`}>{tripCategory}</NextLink>
                    </Pill>
                ))}
            </Stack>
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
        </Container>
    );
}
