import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { auth, AuthHeaders } from '@tc/auth';
import type { Response } from 'express';
import { AppService } from '../src/app/app.service';

type AuthApiMock = {
    signUpEmail: jest.Mock;
    signInEmail: jest.Mock;
    verifyEmailOTP: jest.Mock;
    getToken: jest.Mock;
    getSession: jest.Mock;
    signOut: jest.Mock;
};

jest.mock('@tc/auth', () => ({
    auth: {
        api: {
            signUpEmail: jest.fn(),
            signInEmail: jest.fn(),
            verifyEmailOTP: jest.fn(),
            getToken: jest.fn(),
            getSession: jest.fn(),
            signOut: jest.fn(),
        },
    },
    AuthHeaders: {
        fromRequest: jest.fn(() => new Headers()),
        getSessionToken: jest.fn(),
    },
    AUTH_ACCESS_TOKEN_COOKIE: 'access-token',
    AUTH_REFRESH_TOKEN_COOKIE: 'refresh-token',
}));

const createMockResponse = (): jest.Mocked<Pick<Response, 'cookie' | 'clearCookie'>> => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
});

describe('AppService', () => {
    let service: AppService;
    const authApi = auth.api as unknown as AuthApiMock;

    beforeAll(async () => {
        const app = await Test.createTestingModule({ providers: [AppService] }).compile();
        service = app.get<AppService>(AppService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        authApi.getToken.mockResolvedValue({ token: 'jwt-access-token' });
    });

    describe('setAuthCookies', () => {
        it('sets access and refresh token cookies', async () => {
            const res = createMockResponse();

            await service.setAuthCookies(res as unknown as Response, 'jwt-access-token', 'session-token');

            expect(res.cookie).toHaveBeenCalledWith(
                'access-token',
                'jwt-access-token',
                expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'lax', path: '/' }),
            );
            expect(res.cookie).toHaveBeenCalledWith(
                'refresh-token',
                'session-token',
                expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'lax', path: '/' }),
            );
        });
    });

    describe('clearAuthCookies', () => {
        it('clears access and refresh token cookies', () => {
            const res = createMockResponse();
            service.clearAuthCookies(res as unknown as Response);
            expect(res.clearCookie).toHaveBeenCalledWith('access-token', expect.objectContaining({ httpOnly: true }));
            expect(res.clearCookie).toHaveBeenCalledWith('refresh-token', expect.objectContaining({ httpOnly: true }));
        });
    });

    describe('getMe', () => {
        it('returns the authenticated user', async () => {
            const user = { id: '1', email: 'jane@example.com', name: 'Jane Doe' };
            authApi.getSession.mockResolvedValue({ user });
            await expect(service.getMe({ headers: {}, cookies: {} } as never)).resolves.toEqual(user);
        });

        it('throws when no session exists', async () => {
            authApi.getSession.mockResolvedValue(null);
            await expect(service.getMe({ headers: {}, cookies: {} } as never)).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });

    describe('signOut', () => {
        it('signs out and clears cookies', async () => {
            const req = { headers: {}, cookies: {} } as never;
            const res = createMockResponse();
            (AuthHeaders.getSessionToken as jest.Mock).mockReturnValue('session-token');
            authApi.signOut.mockResolvedValue(undefined);

            await expect(service.signOut(req, res as unknown as Response)).resolves.toEqual({ success: true });
            expect(authApi.signOut).toHaveBeenCalled();
            expect(res.clearCookie).toHaveBeenCalled();
        });

        it('throws when no session token is present', async () => {
            (AuthHeaders.getSessionToken as jest.Mock).mockReturnValue(undefined);
            await expect(service.signOut({ headers: {}, cookies: {} } as never, {} as Response)).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });

    describe('signUp', () => {
        const dto = { name: 'Jane Doe', email: 'jane@example.com', password: 'Str0ngPass!', username: 'janedoe' };
        const user = { id: '1', email: dto.email, name: dto.name };

        it('returns user with session and access tokens', async () => {
            authApi.signUpEmail.mockResolvedValue({ token: 'session-token', user });
            await expect(service.signUp(dto)).resolves.toEqual({ ...user, sessionToken: 'session-token', accessToken: 'jwt-access-token' });
            expect(authApi.signUpEmail).toHaveBeenCalledWith({ body: dto });
            expect(authApi.getToken).toHaveBeenCalledWith({ headers: expect.objectContaining({ get: expect.any(Function) }) });
        });

        it('returns user without tokens when email verification is required', async () => {
            authApi.signUpEmail.mockResolvedValue({ token: null, user });
            await expect(service.signUp(dto)).resolves.toEqual(user);
            expect(authApi.getToken).not.toHaveBeenCalled();
        });
    });

    describe('signIn', () => {
        const dto = { email: 'jane@example.com', password: 'Str0ngPass!' };
        const user = { id: '1', email: dto.email, name: 'Jane Doe' };

        it('returns user with session and access tokens', async () => {
            authApi.signInEmail.mockResolvedValue({ token: 'session-token', user });
            await expect(service.signIn(dto)).resolves.toEqual({ ...user, sessionToken: 'session-token', accessToken: 'jwt-access-token' });
            expect(authApi.signInEmail).toHaveBeenCalledWith({ body: dto });
        });

        it('throws when sign-in does not return a session token', async () => {
            authApi.signInEmail.mockResolvedValue({ token: null, user });
            await expect(service.signIn(dto)).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });

    describe('verifyEmail', () => {
        const dto = { email: 'jane@example.com', otp: '123456' };
        const user = { id: '1', email: dto.email, name: 'Jane Doe' };

        it('returns user with session and access tokens', async () => {
            authApi.verifyEmailOTP.mockResolvedValue({ token: 'session-token', user });
            await expect(service.verifyEmail(dto)).resolves.toEqual({ ...user, sessionToken: 'session-token', accessToken: 'jwt-access-token' });
            expect(authApi.verifyEmailOTP).toHaveBeenCalledWith({ body: dto });
        });

        it('throws when verification does not return a session token', async () => {
            authApi.verifyEmailOTP.mockResolvedValue({ token: null, user });
            await expect(service.verifyEmail(dto)).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });
});
