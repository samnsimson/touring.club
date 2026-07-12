import { Compass, MessagesSquare, Users } from 'lucide-react';
import { Box, Container, Heading, SimpleGrid, Stack, Text } from '@tc/ui';

export const metadata = {
    title: 'About — touring.club',
};

const values = [
    {
        icon: Compass,
        title: 'Discovery over booking',
        description: "We're built for finding a trip and the people going on it — not for hotel or flight checkout flows.",
    },
    {
        icon: Users,
        title: 'Community first',
        description: 'Every trip is an opportunity to meet travelers who share your interests, before you even leave home.',
    },
    {
        icon: MessagesSquare,
        title: 'Real-time coordination',
        description: 'Group chat, itinerary updates, and announcements all live inside the trip — no scattered group texts.',
    },
];

export default function AboutPage() {
    return (
        <Container maxW="4xl" py="16">
            <Stack gap="4" mb="12">
                <Heading size="4xl">About touring.club</Heading>
                <Text fontSize="lg" color="gray.600">
                    touring.club is a social travel platform that helps people discover, organize, and join group trips, local experiences, road trips,
                    sightseeing tours, hiking adventures, and community-driven travel events.
                </Text>
                <Text color="gray.600">
                    We combine travel discovery, event management, community building, and real-time communication into one place — focused on experiences and
                    the people sharing them, not on booking hotels or flights.
                </Text>
            </Stack>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap="8">
                {values.map(({ icon: Icon, title, description }) => (
                    <Stack key={title} gap="3">
                        <Box bg="sunset.50" w="12" h="12" borderRadius="xl" display="flex" alignItems="center" justifyContent="center" color="brand.fg">
                            <Icon size={24} />
                        </Box>
                        <Heading size="md">{title}</Heading>
                        <Text color="gray.600">{description}</Text>
                    </Stack>
                ))}
            </SimpleGrid>
        </Container>
    );
}
