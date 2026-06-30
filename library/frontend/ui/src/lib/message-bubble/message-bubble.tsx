import { Box, Stack, Text } from '@chakra-ui/react';

export interface MessageBubbleProps {
    body: string;
    senderName: string;
    createdAt: string;
    isOwn: boolean;
    isSystem?: boolean;
}

function formatTime(timestamp: string): string {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
}

export function MessageBubble({ body, senderName, createdAt, isOwn, isSystem }: MessageBubbleProps) {
    if (isSystem) {
        return (
            <Text textAlign="center" fontSize="xs" color="gray.500" py="2">
                {body}
            </Text>
        );
    }

    return (
        <Stack align={isOwn ? 'flex-end' : 'flex-start'} gap="1">
            {!isOwn ? (
                <Text fontSize="xs" color="gray.500" px="1">
                    {senderName}
                </Text>
            ) : null}
            <Box
                maxW="sm"
                bg={isOwn ? 'brand.solid' : 'gray.100'}
                color={isOwn ? 'brand.contrast' : 'gray.900'}
                px="4"
                py="2.5"
                borderRadius="2xl"
                borderBottomRightRadius={isOwn ? 'sm' : '2xl'}
                borderBottomLeftRadius={isOwn ? '2xl' : 'sm'}
            >
                <Text fontSize="sm">{body}</Text>
            </Box>
            <Text fontSize="xs" color="gray.400" px="1">
                {formatTime(createdAt)}
            </Text>
        </Stack>
    );
}
