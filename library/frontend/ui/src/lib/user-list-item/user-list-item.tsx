import { HStack, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { UserAvatar } from '../avatar/user-avatar';

export interface UserListItemProps {
    name: string;
    avatarUrl?: string;
    meta?: string;
    action?: ReactNode;
}

export function UserListItem({ name, avatarUrl, meta, action }: UserListItemProps) {
    return (
        <HStack justify="space-between" py="2">
            <HStack gap="3">
                <UserAvatar name={name} src={avatarUrl} size="sm" />
                <Stack gap="0">
                    <Text fontWeight="medium">{name}</Text>
                    {meta ? (
                        <Text fontSize="sm" color="gray.600">
                            {meta}
                        </Text>
                    ) : null}
                </Stack>
            </HStack>
            {action}
        </HStack>
    );
}
