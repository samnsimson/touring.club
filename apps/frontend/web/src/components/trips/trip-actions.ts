'use server';

import { auth } from '@/auth';
import { joinTrip, leaveTrip } from '@/lib/trips-service-client';

export interface TripMembershipActionResult {
    status?: 'pending' | 'active' | 'rejected' | 'left' | 'removed';
    error?: string;
    alreadyMember?: boolean;
}

export async function joinTripAction(tripId: string): Promise<TripMembershipActionResult> {
    const session = await auth();
    const accessToken = session?.user?.accessToken;
    if (!accessToken) return { error: 'Sign in to join this trip.' };

    const { data, response } = await joinTrip({ path: { tripId }, headers: { authorization: `Bearer ${accessToken}` } });
    if (!data?.membership) {
        if (response?.status === 409) return { error: "You're already part of this trip.", alreadyMember: true };
        return { error: 'Could not join this trip. Please try again.' };
    }

    return { status: data.membership.status };
}

export async function leaveTripAction(tripId: string): Promise<TripMembershipActionResult> {
    const session = await auth();
    const accessToken = session?.user?.accessToken;
    if (!accessToken) return { error: 'Sign in to manage this trip.' };

    const { data } = await leaveTrip({ path: { tripId }, headers: { authorization: `Bearer ${accessToken}` } });
    if (!data?.membership) return { error: 'Could not leave this trip. Please try again.' };

    return { status: data.membership.status };
}
