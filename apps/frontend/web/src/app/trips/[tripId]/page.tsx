import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Box, CategoryPill, Container, Heading, HStack, Image, Link as ChakraLink, Stack, Text } from '@tc/ui';
import { getPublicTrip } from '@/lib/trips-service-client';

function formatDateRange(startDate: string, endDate: string): string {
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${formatter.format(new Date(startDate))} – ${formatter.format(new Date(endDate))}`;
}

export async function generateMetadata({ params }: { params: Promise<{ tripId: string }> }) {
    const { tripId } = await params;
    const { data } = await getPublicTrip({ path: { tripId } });
    return { title: data ? `${data.trip.title} — touring.club` : 'Trip not found — touring.club' };
}

export default async function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
    const { tripId } = await params;
    const { data } = await getPublicTrip({ path: { tripId } });
    if (!data) notFound();

    const { trip } = data;

    return (
        <Container maxW="5xl" py="10">
            <ChakraLink asChild fontSize="sm" color="gray.600" mb="4" display="inline-block">
                <NextLink href="/trips">← Back to trips</NextLink>
            </ChakraLink>
            {trip.coverImageUrls[0] ? (
                <Box position="relative" h={{ base: '220px', md: '360px' }} borderRadius="xl" overflow="hidden" mb="6">
                    <Image src={trip.coverImageUrls[0]} alt={trip.title} w="full" h="full" objectFit="cover" />
                </Box>
            ) : null}
            <Stack gap="2" mb="4">
                {trip.categories.length > 0 ? (
                    <HStack gap="2" wrap="wrap">
                        {trip.categories.map((category) => (
                            <CategoryPill key={category} category={category} />
                        ))}
                    </HStack>
                ) : null}
                <Heading size="3xl">{trip.title}</Heading>
                <HStack color="gray.600" gap="1">
                    <MapPin size={18} />
                    <Text>{trip.destination}</Text>
                </HStack>
            </Stack>

            <Stack gap="6" mt="10" maxW="3xl">
                {trip.description ? (
                    <Stack gap="2">
                        <Heading size="lg">About this trip</Heading>
                        <Text color="gray.700">{trip.description}</Text>
                    </Stack>
                ) : null}
                <Stack gap="2">
                    <Heading size="lg">Details</Heading>
                    <HStack color="gray.700" gap="2">
                        <Calendar size={18} />
                        <Text>{formatDateRange(trip.startDate, trip.endDate)}</Text>
                    </HStack>
                    {trip.meetingLocation ? (
                        <HStack color="gray.700" gap="2">
                            <MapPin size={18} />
                            <Text>Meeting at {trip.meetingLocation}</Text>
                        </HStack>
                    ) : null}
                    <HStack color="gray.700" gap="2">
                        <Users size={18} />
                        <Text>Capacity: {trip.capacity}</Text>
                    </HStack>
                </Stack>
            </Stack>
        </Container>
    );
}
