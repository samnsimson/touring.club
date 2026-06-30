import { Box, Card, Center, Heading, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { Logo } from './logo';

export interface AuthCardProps {
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
    return (
        <Center minH="100dvh" bg="gray.50" px="4" py="12">
            <Box w="full" maxW="md">
                <Stack align="center" mb="6">
                    <Logo />
                </Stack>
                <Card.Root variant="outline">
                    <Card.Body gap="6" p="8">
                        <Stack gap="1">
                            <Heading size="lg">{title}</Heading>
                            {description ? (
                                <Text color="gray.600" fontSize="sm">
                                    {description}
                                </Text>
                            ) : null}
                        </Stack>
                        {children}
                    </Card.Body>
                </Card.Root>
                {footer ? (
                    <Text textAlign="center" mt="6" fontSize="sm" color="gray.600">
                        {footer}
                    </Text>
                ) : null}
            </Box>
        </Center>
    );
}
