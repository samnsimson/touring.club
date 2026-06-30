import { Card, Stack, Text, Heading } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface StatCardProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
    return (
        <Card.Root variant="outline">
            <Card.Body>
                <Stack direction="row" align="center" justify="space-between">
                    <Stack gap="1">
                        <Text fontSize="sm" color="gray.600">
                            {label}
                        </Text>
                        <Heading size="xl" color="gray.900">
                            {value}
                        </Heading>
                    </Stack>
                    {icon}
                </Stack>
            </Card.Body>
        </Card.Root>
    );
}
