'use client';

import { Box, Container, Stack, Text, Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { LayoutDashboard, Map, CheckCircle2, MessageCircle, Bell, User, Settings } from 'lucide-react';

const sidebarLinks = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Trips', href: '/dashboard/trips', icon: Map },
    { label: 'Joined Trips', href: '/dashboard/trips/joined', icon: CheckCircle2 },
    { label: 'Messages', href: '/messages', icon: MessageCircle },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <Container maxW="7xl" py="8">
            <Stack direction={{ base: 'column', md: 'row' }} gap="8" align="start">
                <Box as="nav" w={{ base: 'full', md: '64' }} flexShrink="0">
                    <Stack gap="1">
                        {sidebarLinks.map((link) => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;
                            return (
                                <ChakraLink
                                    key={link.href}
                                    asChild
                                    display="flex"
                                    alignItems="center"
                                    gap="2"
                                    px="3"
                                    py="2"
                                    borderRadius="lg"
                                    bg={isActive ? 'brand.subtle' : 'transparent'}
                                    color={isActive ? 'brand.fg' : 'gray.700'}
                                    fontWeight="medium"
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    <NextLink href={link.href}>
                                        <Icon size={18} />
                                        <Text>{link.label}</Text>
                                    </NextLink>
                                </ChakraLink>
                            );
                        })}
                    </Stack>
                </Box>
                <Box flex="1" minW="0" w="full">
                    {children}
                </Box>
            </Stack>
        </Container>
    );
}
