import { Box, HStack, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

export interface NotificationItemProps {
    href: string;
    title: string;
    body: string;
    createdAt: string;
    read: boolean;
    onClick?: () => void;
}

function formatRelative(timestamp: string): string {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffHours = Math.round(diffMs / 3_600_000);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
}

export function NotificationItem({ href, title, body, createdAt, read, onClick }: NotificationItemProps) {
    return (
        <Box asChild onClick={onClick}>
            <NextLink href={href}>
                <HStack align="start" gap="3" p="4" borderRadius="lg" bg={read ? 'transparent' : 'brand.subtle'} _hover={{ bg: 'gray.50' }}>
                    {!read ? <Box mt="2" w="2" h="2" borderRadius="full" bg="brand.solid" flexShrink="0" /> : <Box w="2" flexShrink="0" />}
                    <Stack gap="1">
                        <Text fontWeight="medium">{title}</Text>
                        <Text fontSize="sm" color="gray.600">
                            {body}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                            {formatRelative(createdAt)}
                        </Text>
                    </Stack>
                </HStack>
            </NextLink>
        </Box>
    );
}
