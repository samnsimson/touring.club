import { MapPin } from 'lucide-react';
import { Box, CategoryPill, Heading, HStack, PageHeader, SimpleGrid, Stack, StatCard, Text, UserAvatar } from '@tc/ui';
import { currentUser } from '@tc/mocks';

export const metadata = {
    title: 'Profile — touring.club',
};

export default function ProfilePage() {
    return (
        <>
            <PageHeader title="Profile" description="How other travelers see you." />
            <Stack direction={{ base: 'column', md: 'row' }} gap="8">
                <Stack
                    gap="4"
                    flex="1"
                    p="6"
                    borderWidth="1px"
                    borderRadius="xl"
                    align={{ base: 'center', md: 'start' }}
                    textAlign={{ base: 'center', md: 'left' }}
                >
                    <UserAvatar name={currentUser.name} src={currentUser.avatarUrl} size="xl" />
                    <Box>
                        <Heading size="lg">{currentUser.name}</Heading>
                        <Text color="gray.500">@{currentUser.username}</Text>
                    </Box>
                    <HStack color="gray.600" gap="1">
                        <MapPin size={16} />
                        <Text>{currentUser.location}</Text>
                    </HStack>
                    <Text color="gray.700">{currentUser.bio}</Text>
                    <HStack gap="2" wrap="wrap">
                        {currentUser.interests.map((interest) => (
                            <CategoryPill key={interest} category={interest} />
                        ))}
                    </HStack>
                </Stack>
                <Stack gap="4" flex="1">
                    <SimpleGrid columns={2} gap="4">
                        <StatCard label="Trips organized" value={currentUser.tripsOrganizedCount} />
                        <StatCard label="Trips joined" value={currentUser.tripsJoinedCount} />
                    </SimpleGrid>
                </Stack>
            </Stack>
        </>
    );
}
