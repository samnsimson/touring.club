import { UnauthorizedException } from '@nestjs/common';
import { AuthUtils } from '../src/app/auth.utils';

describe('AuthUtils', () => {
    describe('getHeaders', () => {
        it('returns headers with a bearer token', () => {
            const headers = AuthUtils.getHeaders('session-token');

            expect(headers.get('Authorization')).toBe('Bearer session-token');
        });

        it('merges default headers', () => {
            const defaultHeaders = new Headers({ 'x-custom': 'value' });
            const headers = AuthUtils.getHeaders('session-token', defaultHeaders);

            expect(headers.get('Authorization')).toBe('Bearer session-token');
            expect(headers.get('x-custom')).toBe('value');
        });

        it('throws when token is missing', () => {
            expect(() => AuthUtils.getHeaders(null)).toThrow(UnauthorizedException);
        });
    });
});
