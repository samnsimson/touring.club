import { Box, HStack, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { UserAvatar } from '../avatar/user-avatar';

export interface ConversationListItemProps {
    href: string;
    title: string;
    avatarUrl: string;
    lastMessagePreview: string;
    unreadCount: number;
    active?: boolean;
}

export function ConversationListItem({ href, title, avatarUrl, lastMessagePreview, unreadCount, active }: ConversationListItemProps) {
    return (
        <Box asChild>
            <NextLink href={href}>
                <HStack gap="3" p="3" borderRadius="lg" bg={active ? 'brand.subtle' : 'transparent'} _hover={{ bg: 'gray.50' }} align="start">
                    <UserAvatar name={title} src={avatarUrl} size="sm" />
                    <Stack gap="0" flex="1" minW="0">
                        <Text fontWeight="medium" lineClamp={1}>
                            {title}
                        </Text>
                        <Text fontSize="sm" color="gray.600" lineClamp={1}>
                            {lastMessagePreview}
                        </Text>
                    </Stack>
                    {unreadCount > 0 ? (
                        <Box
                            bg="brand.solid"
                            color="brand.contrast"
                            borderRadius="full"
                            minW="5"
                            h="5"
                            px="1.5"
                            fontSize="xs"
                            fontWeight="bold"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            {unreadCount}
                        </Box>
                    ) : null}
                </HStack>
            </NextLink>
        </Box>
    );
}
