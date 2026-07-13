'use client';

import { useSession } from 'next-auth/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { Alert, Button, Stack, Text } from '@tc/ui';
import { joinTripAction, leaveTripAction } from './trip-actions';

export interface TripJoinButtonProps {
    tripId: string;
    organizerId: string;
    visibility: 'public' | 'private';
}

export function TripJoinButton({ tripId, organizerId, visibility }: TripJoinButtonProps) {
    const { data: session, status: sessionStatus } = useSession();
    const [membershipStatus, setMembershipStatus] = useState<'active' | 'pending' | null>(null);
    const [notice, setNotice] = useState<string | undefined>();
    const [error, setError] = useState<string | undefined>();
    const [isPending, setIsPending] = useState(false);

    if (sessionStatus === 'loading') return null;

    if (sessionStatus !== 'authenticated') {
        return (
            <Button asChild colorPalette="orange" size="lg">
                <NextLink href={`/login?callbackUrl=/trips/${tripId}`}>Sign in to join</NextLink>
            </Button>
        );
    }

    if (session.user?.id === organizerId) {
        return (
            <Text fontSize="sm" color="gray.600">
                You&apos;re organizing this trip.
            </Text>
        );
    }

    async function handleJoin() {
        setIsPending(true);
        setError(undefined);
        setNotice(undefined);
        const result = await joinTripAction(tripId);
        setIsPending(false);

        if (result.error) {
            setError(result.error);
            if (result.alreadyMember) setMembershipStatus('active');
            return;
        }

        setMembershipStatus(result.status === 'pending' ? 'pending' : 'active');
    }

    async function handleLeave() {
        setIsPending(true);
        setError(undefined);
        const wasPending = membershipStatus === 'pending';
        const result = await leaveTripAction(tripId);
        setIsPending(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        setMembershipStatus(null);
        setNotice(wasPending ? 'Request cancelled.' : "You've left this trip.");
    }

    return (
        <Stack gap="2" minW="220px">
            {error ? (
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Title>{error}</Alert.Title>
                </Alert.Root>
            ) : null}
            {notice ? (
                <Alert.Root status="info">
                    <Alert.Indicator />
                    <Alert.Title>{notice}</Alert.Title>
                </Alert.Root>
            ) : null}
            {membershipStatus ? (
                <Stack gap="1">
                    <Text fontSize="sm" color={membershipStatus === 'active' ? 'green.600' : 'gray.600'}>
                        {membershipStatus === 'active' ? "You're in! See you there." : 'Request sent — waiting on approval.'}
                    </Text>
                    <Button onClick={handleLeave} loading={isPending} variant="outline" colorPalette="red" size="lg">
                        {membershipStatus === 'pending' ? 'Cancel request' : 'Leave trip'}
                    </Button>
                </Stack>
            ) : (
                <Button onClick={handleJoin} loading={isPending} colorPalette="orange" size="lg">
                    {visibility === 'public' ? 'Join trip' : 'Request to join'}
                </Button>
            )}
        </Stack>
    );
}
