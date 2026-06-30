import { Box, Card, HStack, Heading, Image, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { MapPin, Users } from 'lucide-react';
import { CategoryPill, DifficultyPill } from '../pill/pill';

export interface TripCardProps {
    href: string;
    title: string;
    destination: string;
    coverImageUrl: string;
    startDate: string;
    endDate: string;
    capacity: number;
    joinedCount: number;
    difficulty: string;
    categories: string[];
    priceLabel: string;
}

function formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function TripCard({
    href,
    title,
    destination,
    coverImageUrl,
    startDate,
    endDate,
    capacity,
    joinedCount,
    difficulty,
    categories,
    priceLabel,
}: TripCardProps) {
    return (
        <LinkBox>
            <Card.Root overflow="hidden" variant="outline" h="full" transition="all 0.2s" _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}>
                <Box position="relative" h="190px" overflow="hidden">
                    <Image src={coverImageUrl} alt={title} w="full" h="full" objectFit="cover" />
                    <Box position="absolute" top="3" left="3">
                        <DifficultyPill difficulty={difficulty} />
                    </Box>
                </Box>
                <Card.Body gap="3">
                    <HStack gap="2" wrap="wrap">
                        {categories.map((category) => (
                            <CategoryPill key={category} category={category} />
                        ))}
                    </HStack>
                    <Heading size="md" lineClamp={2}>
                        <LinkOverlay asChild>
                            <NextLink href={href}>{title}</NextLink>
                        </LinkOverlay>
                    </Heading>
                    <HStack color="gray.600" fontSize="sm" gap="1">
                        <MapPin size={16} />
                        <Text>{destination}</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                        {formatDateRange(startDate, endDate)}
                    </Text>
                </Card.Body>
                <Card.Footer justifyContent="space-between" borderTopWidth="1px" pt="3">
                    <HStack color="gray.600" fontSize="sm" gap="1">
                        <Users size={16} />
                        <Text>
                            {joinedCount}/{capacity} joined
                        </Text>
                    </HStack>
                    <Text fontWeight="semibold" color="brand.fg">
                        {priceLabel}
                    </Text>
                </Card.Footer>
            </Card.Root>
        </LinkBox>
    );
}
