import { Flex, Heading, Text, Stack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} gap="4" mb="8">
            <Stack gap="1">
                <Heading size="2xl" color="gray.900">
                    {title}
                </Heading>
                {description ? (
                    <Text color="gray.600" maxW="2xl">
                        {description}
                    </Text>
                ) : null}
            </Stack>
            {actions}
        </Flex>
    );
}
