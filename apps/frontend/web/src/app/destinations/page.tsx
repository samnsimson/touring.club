import { Container, DestinationCard, PageHeader, SimpleGrid } from '@tc/ui';
import { mockDestinations } from '@tc/mocks';

export const metadata = {
    title: 'Destinations — touring.club',
};

export default function DestinationsPage() {
    return (
        <Container maxW="7xl" py="10">
            <PageHeader title="Popular destinations" description="Explore where travelers are heading next and see every trip planned there." />
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="6">
                {mockDestinations.map((destination) => (
                    <DestinationCard
                        key={destination.id}
                        href={`/destinations/${destination.id}`}
                        name={destination.name}
                        country={destination.country}
                        imageUrl={destination.imageUrl}
                        tripCount={destination.tripCount}
                    />
                ))}
            </SimpleGrid>
        </Container>
    );
}
