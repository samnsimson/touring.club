import { BadRequestException } from '@nestjs/common';
import { TripStatusUtils } from '../../src/app/trip.status';

describe('TripStatusUtils', () => {
    it('allows draft to publish', () => {
        expect(() => TripStatusUtils.assertCanTransition('draft', 'published')).not.toThrow();
    });

    it('rejects published to publish', () => {
        expect(() => TripStatusUtils.assertCanTransition('published', 'published')).toThrow(BadRequestException);
    });

    it('allows published to cancel', () => {
        expect(() => TripStatusUtils.assertCanTransition('published', 'cancelled')).not.toThrow();
    });

    it('rejects archived transitions', () => {
        expect(() => TripStatusUtils.assertCanTransition('archived', 'published')).toThrow(BadRequestException);
    });

    it('allows editing draft trips', () => {
        expect(() => TripStatusUtils.assertEditable('draft')).not.toThrow();
    });

    it('rejects editing cancelled trips', () => {
        expect(() => TripStatusUtils.assertEditable('cancelled')).toThrow(BadRequestException);
    });
});
