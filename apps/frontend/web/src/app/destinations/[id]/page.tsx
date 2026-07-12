import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { Box, Container, Heading, Image, Link as ChakraLink, SimpleGrid, Stack, Text, TripCard } from '@tc/ui';
import { mockDestinations, mockTrips } from '@tc/mocks';

export function generateStaticParams() {
    return mockDestinations.map((destination) => ({ id: destination.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const destination = mockDestinations.find((candidate) => candidate.id === id);
    return { title: destination ? `${destination.name} — touring.club` : 'Destination not found — touring.club' };
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const destination = mockDestinations.find((candidate) => candidate.id === id);
    if (!destination) notFound();

    const trips = mockTrips.filter((trip) => trip.status === 'published' && trip.destination.includes(destination.name));

    return (
        <Container maxW="7xl" py="10">
            <ChakraLink asChild fontSize="sm" color="gray.600" mb="4" display="inline-block">
                <NextLink href="/destinations">← Back to destinations</NextLink>
            </ChakraLink>
            <Box position="relative" h={{ base: '220px', md: '320px' }} borderRadius="xl" overflow="hidden" mb="6">
                <Image src={destination.imageUrl} alt={destination.name} w="full" h="full" objectFit="cover" />
                <Box position="absolute" inset="0" bg="blackAlpha.500" />
                <Stack position="absolute" bottom="0" left="0" p="6" gap="0" color="white">
                    <Heading size="3xl">{destination.name}</Heading>
                    <Text fontSize="lg" opacity="0.9">
                        {destination.country}
                    </Text>
                </Stack>
            </Box>
            <Text color="gray.700" maxW="3xl" mb="10">
                {destination.description}
            </Text>

            <Heading size="xl" mb="6">
                Trips in {destination.name}
            </Heading>
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
                <Text color="gray.600">No published trips here yet — check back soon.</Text>
            )}
        </Container>
    );
}
