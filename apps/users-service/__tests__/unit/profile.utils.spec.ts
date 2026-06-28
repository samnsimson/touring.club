import { UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from '@tc/auth';
import { ProfileUtils } from '../../src/app/profile.utils';

describe('ProfileUtils', () => {
    describe('getUserId', () => {
        it('returns userId from the session payload', () => {
            const req = { session: { userId: 'user-1' } } as AuthenticatedRequest;
            expect(ProfileUtils.getUserId(req)).toBe('user-1');
        });

        it('falls back to sub when userId is missing', () => {
            const req = { session: { sub: 'user-2' } } as AuthenticatedRequest;
            expect(ProfileUtils.getUserId(req)).toBe('user-2');
        });

        it('throws when no user id is present', () => {
            const req = { session: {} } as AuthenticatedRequest;
            expect(() => ProfileUtils.getUserId(req)).toThrow(UnauthorizedException);
        });
    });
});
