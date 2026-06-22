import { HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { AuthUtils } from '../src/app/auth.utils';

const createMockResponse = (): jest.Mocked<Pick<Response, 'append' | 'setHeader'>> => ({
    append: jest.fn(),
    setHeader: jest.fn(),
});

describe('auth.utils', () => {
    describe('applyAuthHeaders', () => {
        it('appends Set-Cookie headers', () => {
            const res = createMockResponse();
            const authHeaders = new Headers({ 'set-cookie': 'session=abc; Path=/' });
            AuthUtils.applyAuthHeaders(authHeaders, res as unknown as Response);
            expect(res.append).toHaveBeenCalledWith('Set-Cookie', 'session=abc; Path=/');
            expect(res.setHeader).not.toHaveBeenCalled();
        });

        it('sets non-cookie headers', () => {
            const res = createMockResponse();
            const authHeaders = new Headers({ 'x-auth-token': 'token-value' });
            AuthUtils.applyAuthHeaders(authHeaders, res as unknown as Response);
            expect(res.setHeader).toHaveBeenCalledWith('x-auth-token', 'token-value');
            expect(res.append).not.toHaveBeenCalled();
        });
    });

    describe('mapAuthError', () => {
        it('throws HttpException for Better Auth API errors', () => {
            try {
                AuthUtils.mapAuthError({ message: 'Invalid email or password', status: 'INVALID_EMAIL_OR_PASSWORD', statusCode: HttpStatus.UNAUTHORIZED });
                throw new Error('expected mapAuthError to throw');
            } catch (error) {
                expect(error).toBeInstanceOf(HttpException);
                expect((error as HttpException).getResponse()).toEqual({ message: 'Invalid email or password', code: 'INVALID_EMAIL_OR_PASSWORD' });
                expect((error as HttpException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
            }
        });

        it('rethrows plain objects that are not auth API errors', () => {
            const error = { message: 'Bad request', status: 'BAD_REQUEST' };
            expect(() => AuthUtils.mapAuthError(error)).toThrow();
            try {
                AuthUtils.mapAuthError(error);
            } catch (thrown) {
                expect(thrown).toBe(error);
            }
        });

        it('rethrows unknown errors', () => {
            const error = new Error('unexpected');
            expect(() => AuthUtils.mapAuthError(error)).toThrow(error);
        });
    });
});
