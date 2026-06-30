import { Stack, Text, Heading } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <Stack align="center" textAlign="center" gap="3" py="16" px="6" color="gray.600">
            {icon}
            <Heading size="md" color="gray.800">
                {title}
            </Heading>
            {description ? <Text maxW="sm">{description}</Text> : null}
            {action}
        </Stack>
    );
}
