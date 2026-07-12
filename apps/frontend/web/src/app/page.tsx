import NextLink from 'next/link';
import { Compass, MessagesSquare, Users } from 'lucide-react';
import { Box, Button, Container, DestinationCard, Heading, Pill, SimpleGrid, Stack, Text, TripCard } from '@tc/ui';
import { mockDestinations } from '@tc/mocks';
import { discoverTrips } from '@/lib/trips-service-client';

const featuredDestinations = mockDestinations.slice(0, 4);

const valueProps = [
    {
        icon: Compass,
        title: 'Discover trips',
        description: 'Browse hikes, road trips, food tours, and adventures curated by travelers like you.',
    },
    {
        icon: Users,
        title: 'Join a community',
        description: 'Meet fellow travelers who share your interests before you even leave home.',
    },
    {
        icon: MessagesSquare,
        title: 'Coordinate in real time',
        description: 'Group chat, itinerary updates, and announcements all live inside each trip.',
    },
];

export default async function HomePage() {
    const { data } = await discoverTrips({});
    const trips = data?.trips ?? [];
    const categories = [...new Set(trips.flatMap((trip) => trip.categories))].sort();
    const featuredTrips = trips.slice(0, 6);

    return (
        <Box>
            <Box bg="ocean.900" color="white">
                <Container maxW="7xl" py={{ base: 16, md: 24 }}>
                    <Stack gap="6" maxW="2xl">
                        <Heading size="4xl" lineHeight="1.1">
                            Find your next group adventure
                        </Heading>
                        <Text fontSize="lg" color="whiteAlpha.800">
                            touring.club connects travelers to trips, tours, and communities — from backcountry treks to backstreet food crawls. Discover a
                            trip, join the group chat, and go.
                        </Text>
                        <Stack direction={{ base: 'column', sm: 'row' }} gap="4">
                            <Button asChild size="lg" colorPalette="orange">
                                <NextLink href="/trips">Browse trips</NextLink>
                            </Button>
                            <Button asChild size="lg" variant="outline" borderColor="whiteAlpha.500" color="white" _hover={{ bg: 'whiteAlpha.200' }}>
                                <NextLink href="/register">Become an organizer</NextLink>
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {categories.length > 0 ? (
                <Container maxW="7xl" py="10">
                    <Stack direction="row" gap="3" wrap="wrap" justify="center">
                        {categories.map((category) => (
                            <Pill key={category} colorPalette="teal" variant="surface">
                                <NextLink href={`/trips?category=${encodeURIComponent(category)}`}>{category}</NextLink>
                            </Pill>
                        ))}
                    </Stack>
                </Container>
            ) : null}

            <Container maxW="7xl" py="10">
                <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb="8">
                    <Heading size="2xl">Featured trips</Heading>
                    <Button asChild variant="ghost" colorPalette="orange">
                        <NextLink href="/trips">View all trips →</NextLink>
                    </Button>
                </Stack>
                {featuredTrips.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="6">
                        {featuredTrips.map((trip) => (
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

            <Container maxW="7xl" py="10">
                <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb="8">
                    <Heading size="2xl">Popular destinations</Heading>
                    <Button asChild variant="ghost" colorPalette="orange">
                        <NextLink href="/destinations">Explore destinations →</NextLink>
                    </Button>
                </Stack>
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="6">
                    {featuredDestinations.map((destination) => (
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

            <Box bg="sunset.50" py="16">
                <Container maxW="7xl">
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap="10">
                        {valueProps.map(({ icon: Icon, title, description }) => (
                            <Stack key={title} gap="3">
                                <Box
                                    bg="white"
                                    w="12"
                                    h="12"
                                    borderRadius="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    color="brand.fg"
                                    shadow="sm"
                                >
                                    <Icon size={24} />
                                </Box>
                                <Heading size="md">{title}</Heading>
                                <Text color="gray.600">{description}</Text>
                            </Stack>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            <Container maxW="7xl" py="16" textAlign="center">
                <Stack align="center" gap="4">
                    <Heading size="2xl">Ready to plan your next trip?</Heading>
                    <Text color="gray.600" maxW="lg">
                        Create a free account, publish a trip, and start building your travel community today.
                    </Text>
                    <Button asChild size="lg" colorPalette="orange">
                        <NextLink href="/register">Get started</NextLink>
                    </Button>
                </Stack>
            </Container>
        </Box>
    );
}
