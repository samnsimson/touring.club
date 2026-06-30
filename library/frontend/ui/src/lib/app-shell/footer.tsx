import { Box, Container, HStack, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { Logo } from './logo';

const footerLinks = [
    { label: 'Discover Trips', href: '/trips' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'About', href: '/about' },
];

export function Footer() {
    return (
        <Box as="footer" borderTopWidth="1px" bg="white" mt="20">
            <Container maxW="7xl" py="10">
                <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} gap="6">
                    <Logo />
                    <HStack gap="6">
                        {footerLinks.map((link) => (
                            <ChakraLink key={link.href} asChild color="gray.600" _hover={{ color: 'brand.fg' }}>
                                <NextLink href={link.href}>{link.label}</NextLink>
                            </ChakraLink>
                        ))}
                    </HStack>
                </Stack>
                <Text fontSize="sm" color="gray.500" mt="8">
                    &copy; {new Date().getFullYear()} touring.club. Built for travelers, by travelers.
                </Text>
            </Container>
        </Box>
    );
}
