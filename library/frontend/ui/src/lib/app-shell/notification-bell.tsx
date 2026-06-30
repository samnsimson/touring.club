import { Box, IconButton } from '@chakra-ui/react';
import NextLink from 'next/link';
import { Bell } from 'lucide-react';

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
    return (
        <Box position="relative">
            <IconButton asChild aria-label="Notifications" variant="ghost" colorPalette="gray" borderRadius="full">
                <NextLink href="/notifications">
                    <Bell size={20} />
                </NextLink>
            </IconButton>
            {unreadCount > 0 ? <Box position="absolute" top="0.5" right="0.5" w="2" h="2" borderRadius="full" bg="brand.solid" /> : null}
        </Box>
    );
}
