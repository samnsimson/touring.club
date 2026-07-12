import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Box, Button, CategoryPill, Container, DifficultyPill, Heading, HStack, Image, Link as ChakraLink, Stack, Text, UserListItem } from '@tc/ui';
import { getTripBySlug, getUserById, mockTrips } from '@tc/mocks';

function formatDateRange(startDate: string, endDate: string): string {
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${formatter.format(new Date(startDate))} – ${formatter.format(new Date(endDate))}`;
}

export function generateStaticParams() {
    return mockTrips.map((trip) => ({ slug: trip.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const trip = getTripBySlug(slug);
    return { title: trip ? `${trip.title} — touring.club` : 'Trip not found — touring.club' };
}

export default async function TripDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const trip = getTripBySlug(slug);
    if (!trip) notFound();

    const organizer = getUserById(trip.organizerId);
    const spotsLeft = trip.capacity - trip.joinedCount;

    return (
        <Container maxW="5xl" py="10">
            <ChakraLink asChild fontSize="sm" color="gray.600" mb="4" display="inline-block">
                <NextLink href="/trips">← Back to trips</NextLink>
            </ChakraLink>
            <Box position="relative" h={{ base: '220px', md: '360px' }} borderRadius="xl" overflow="hidden" mb="6">
                <Image src={trip.coverImageUrl} alt={trip.title} w="full" h="full" objectFit="cover" />
            </Box>
            <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} gap="4" mb="4">
                <Stack gap="2">
                    <HStack gap="2" wrap="wrap">
                        {trip.categories.map((category) => (
                            <CategoryPill key={category} category={category} />
                        ))}
                        <DifficultyPill difficulty={trip.difficulty} />
                    </HStack>
                    <Heading size="3xl">{trip.title}</Heading>
                    <HStack color="gray.600" gap="1">
                        <MapPin size={18} />
                        <Text>{trip.destination}</Text>
                    </HStack>
                </Stack>
                <Stack gap="2" minW="180px">
                    <Text fontSize="2xl" fontWeight="bold" color="brand.fg">
                        {trip.priceLabel}
                    </Text>
                    <Button colorPalette="orange" size="lg" disabled={spotsLeft <= 0}>
                        {spotsLeft > 0 ? 'Request to join' : 'Trip full'}
                    </Button>
                </Stack>
            </Stack>

            <Stack direction={{ base: 'column', md: 'row' }} gap="8" mt="10">
                <Stack gap="6" flex="2">
                    <Stack gap="2">
                        <Heading size="lg">About this trip</Heading>
                        <Text color="gray.700">{trip.description}</Text>
                    </Stack>
                    <Stack gap="2">
                        <Heading size="lg">Details</Heading>
                        <HStack color="gray.700" gap="2">
                            <Calendar size={18} />
                            <Text>{formatDateRange(trip.startDate, trip.endDate)}</Text>
                        </HStack>
                        <HStack color="gray.700" gap="2">
                            <MapPin size={18} />
                            <Text>Meeting at {trip.meetingLocation}</Text>
                        </HStack>
                        <HStack color="gray.700" gap="2">
                            <Users size={18} />
                            <Text>
                                {trip.joinedCount}/{trip.capacity} joined
                                {spotsLeft > 0 ? ` · ${spotsLeft} spots left` : ''}
                            </Text>
                        </HStack>
                    </Stack>
                </Stack>
                {organizer ? (
                    <Stack gap="3" flex="1" p="5" borderWidth="1px" borderRadius="xl" h="fit-content">
                        <Heading size="sm" color="gray.600">
                            Organized by
                        </Heading>
                        <UserListItem name={organizer.name} avatarUrl={organizer.avatarUrl} meta={organizer.location} />
                    </Stack>
                ) : null}
            </Stack>
        </Container>
    );
}
