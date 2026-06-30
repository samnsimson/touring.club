'use client';

import { Box, Button, Container, HStack, IconButton, Link as ChakraLink, Stack, useDisclosure } from '@chakra-ui/react';
import NextLink from 'next/link';
import { Menu, X } from 'lucide-react';
import { Logo } from './logo';
import { NotificationBell } from './notification-bell';
import { UserAvatar } from '../avatar/user-avatar';
import { primaryNavLinks } from './nav-links';

export interface NavbarProps {
    isAuthenticated: boolean;
    userName?: string;
    userAvatarUrl?: string;
    unreadNotificationCount?: number;
    onSignOut?: () => void;
}

export function Navbar({ isAuthenticated, userName, userAvatarUrl, unreadNotificationCount = 0, onSignOut }: NavbarProps) {
    const { open, onToggle, onClose } = useDisclosure();
    const links = primaryNavLinks.filter((link) => !link.authOnly || isAuthenticated);

    return (
        <Box as="header" borderBottomWidth="1px" bg="white" position="sticky" top="0" zIndex="10">
            <Container maxW="7xl" py="3">
                <HStack justify="space-between">
                    <HStack gap="8">
                        <Logo />
                        <HStack gap="6" display={{ base: 'none', md: 'flex' }}>
                            {links.map((link) => (
                                <ChakraLink key={link.href} asChild color="gray.700" fontWeight="medium" _hover={{ color: 'brand.fg' }}>
                                    <NextLink href={link.href}>{link.label}</NextLink>
                                </ChakraLink>
                            ))}
                        </HStack>
                    </HStack>

                    <HStack gap="3" display={{ base: 'none', md: 'flex' }}>
                        {isAuthenticated ? (
                            <>
                                <NotificationBell unreadCount={unreadNotificationCount} />
                                <ChakraLink asChild>
                                    <NextLink href="/profile">
                                        <UserAvatar name={userName ?? 'You'} src={userAvatarUrl} size="sm" />
                                    </NextLink>
                                </ChakraLink>
                                <Button variant="ghost" size="sm" onClick={onSignOut}>
                                    Sign out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <NextLink href="/login">Sign in</NextLink>
                                </Button>
                                <Button asChild size="sm" colorPalette="orange">
                                    <NextLink href="/register">Sign up</NextLink>
                                </Button>
                            </>
                        )}
                    </HStack>

                    <IconButton aria-label="Toggle menu" variant="ghost" display={{ base: 'inline-flex', md: 'none' }} onClick={onToggle}>
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </IconButton>
                </HStack>

                {open ? (
                    <Stack display={{ base: 'flex', md: 'none' }} pt="4" gap="3" borderTopWidth="1px" mt="3">
                        {links.map((link) => (
                            <ChakraLink key={link.href} asChild fontWeight="medium" onClick={onClose}>
                                <NextLink href={link.href}>{link.label}</NextLink>
                            </ChakraLink>
                        ))}
                        {isAuthenticated ? (
                            <>
                                <ChakraLink asChild fontWeight="medium" onClick={onClose}>
                                    <NextLink href="/profile">Profile</NextLink>
                                </ChakraLink>
                                <ChakraLink asChild fontWeight="medium" onClick={onClose}>
                                    <NextLink href="/notifications">Notifications</NextLink>
                                </ChakraLink>
                                <Button variant="outline" size="sm" onClick={onSignOut}>
                                    Sign out
                                </Button>
                            </>
                        ) : (
                            <HStack>
                                <Button asChild variant="ghost" size="sm" flex="1">
                                    <NextLink href="/login">Sign in</NextLink>
                                </Button>
                                <Button asChild size="sm" colorPalette="orange" flex="1">
                                    <NextLink href="/register">Sign up</NextLink>
                                </Button>
                            </HStack>
                        )}
                    </Stack>
                ) : null}
            </Container>
        </Box>
    );
}
