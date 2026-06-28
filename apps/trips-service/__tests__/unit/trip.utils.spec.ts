import { UnauthorizedException } from '@nestjs/common';
import { TripUtils } from '../../src/app/trip.utils';

describe('TripUtils', () => {
    it('returns the user id from session.userId', () => {
        expect(TripUtils.getUserId({ session: { userId: 'user-1', sub: 'user-1' } } as never)).toBe('user-1');
    });

    it('falls back to session.sub', () => {
        expect(TripUtils.getUserId({ session: { sub: 'user-2' } } as never)).toBe('user-2');
    });

    it('throws when the session is missing a user id', () => {
        expect(() => TripUtils.getUserId({ session: {} } as never)).toThrow(UnauthorizedException);
    });
});
