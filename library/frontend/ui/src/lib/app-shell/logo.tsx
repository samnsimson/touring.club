import { HStack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { Compass } from 'lucide-react';

export function Logo() {
    return (
        <HStack asChild gap="2" color="brand.fg">
            <NextLink href="/">
                <Compass size={26} strokeWidth={2.25} />
                <Text fontWeight="bold" fontSize="lg" fontFamily="heading">
                    touring.club
                </Text>
            </NextLink>
        </HStack>
    );
}
