import { Box, Heading, Image, LinkBox, LinkOverlay, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

export interface DestinationCardProps {
    href: string;
    name: string;
    country: string;
    imageUrl: string;
    tripCount: number;
}

export function DestinationCard({ href, name, country, imageUrl, tripCount }: DestinationCardProps) {
    return (
        <LinkBox>
            <Box position="relative" borderRadius="xl" overflow="hidden" h="280px" transition="transform 0.2s" _hover={{ transform: 'scale(1.02)' }}>
                <Image src={imageUrl} alt={name} w="full" h="full" objectFit="cover" />
                <Box position="absolute" inset="0" bg="blackAlpha.600" />
                <Stack position="absolute" bottom="0" left="0" right="0" p="5" gap="0" color="white">
                    <Heading size="lg">
                        <LinkOverlay asChild>
                            <NextLink href={href}>{name}</NextLink>
                        </LinkOverlay>
                    </Heading>
                    <Text fontSize="sm" opacity="0.9">
                        {country} · {tripCount} trips
                    </Text>
                </Stack>
            </Box>
        </LinkBox>
    );
}
