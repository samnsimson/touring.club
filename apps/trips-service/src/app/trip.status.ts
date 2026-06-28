import { BadRequestException } from '@nestjs/common';
import type { TripStatus } from '@tc/database';

const transitions: Record<TripStatus, TripStatus[]> = {
    draft: ['published', 'cancelled', 'archived'],
    published: ['cancelled', 'archived'],
    cancelled: ['archived'],
    archived: [],
};

const editableStatuses: TripStatus[] = ['draft', 'published'];

export class TripStatusUtils {
    static assertCanTransition(from: TripStatus, to: TripStatus): void {
        if (!transitions[from].includes(to)) throw new BadRequestException(`Cannot transition trip from ${from} to ${to}`);
    }

    static assertEditable(status: TripStatus): void {
        if (!editableStatuses.includes(status)) throw new BadRequestException('Trip cannot be edited in its current status');
    }
}
