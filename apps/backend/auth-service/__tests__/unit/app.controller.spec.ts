import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AppController } from '../../src/app/app.controller';
import { AppService } from '../../src/app/app.service';

type SignInResult = Awaited<ReturnType<AppService['signIn']>>;

jest.mock('@tc/auth', () => ({
    auth: { api: {} },
    AuthGuard: class AuthGuard {},
    Public: () => () => undefined,
}));

jest.mock('@thallesp/nestjs-better-auth', () => ({
    AuthService: class AuthService {},
}));

describe('AppController', () => {
    let controller: AppController;
    let appService: jest.Mocked<
        Pick<
            AppService,
            | 'signUp'
            | 'signIn'
            | 'verifyEmail'
            | 'setAuthCookies'
            | 'getMe'
            | 'signOut'
            | 'forgotPassword'
            | 'resetPassword'
            | 'changePassword'
            | 'updateProfile'
        >
    >;

    beforeAll(async () => {
        appService = {
            signUp: jest.fn(),
            signIn: jest.fn(),
            verifyEmail: jest.fn(),
            setAuthCookies: jest.fn(),
            getMe: jest.fn(),
            signOut: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            changePassword: jest.fn(),
            updateProfile: jest.fn(),
        };

        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [{ provide: AppService, useValue: appService }],
        }).compile();

        controller = app.get<AppController>(AppController);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        appService.setAuthCookies.mockResolvedValue(undefined);
    });

    const serviceResponse = {
        id: '1',
        email: 'jane@example.com',
        name: 'Jane Doe',
        sessionToken: 'session-token',
        accessToken: 'jwt-access-token',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: true,
        banned: false,
        banExpires: null,
    };

    describe('signUp', () => {
        it('delegates to AppService and sets auth cookies', async () => {
            const dto = { name: 'Jane Doe', email: 'jane@example.com', password: 'Str0ngPass!', username: 'janedoe' };
            const res = {} as Response;

            appService.signUp.mockResolvedValue(serviceResponse);
            await expect(controller.signUp(dto, res)).resolves.toEqual(serviceResponse);
            expect(appService.signUp).toHaveBeenCalledWith(dto);
            expect(appService.setAuthCookies).toHaveBeenCalledWith(res, serviceResponse.accessToken, serviceResponse.sessionToken);
        });

        it('does not set auth cookies when sign-up returns no tokens', async () => {
            const dto = { name: 'Jane Doe', email: 'jane@example.com', password: 'Str0ngPass!', username: 'janedoe' };
            const res = {} as Response;
            const pendingVerification = { ...serviceResponse, sessionToken: undefined, accessToken: undefined };

            appService.signUp.mockResolvedValue(pendingVerification);
            await expect(controller.signUp(dto, res)).resolves.toEqual(pendingVerification);
            expect(appService.setAuthCookies).not.toHaveBeenCalled();
        });

        it('does not set auth cookies when only one token is returned', async () => {
            const dto = { name: 'Jane Doe', email: 'jane@example.com', password: 'Str0ngPass!', username: 'janedoe' };
            const res = {} as Response;
            const accessTokenOnly = { ...serviceResponse, sessionToken: undefined, accessToken: 'jwt-access-token' };
            const sessionTokenOnly = { ...serviceResponse, sessionToken: 'session-token', accessToken: undefined };

            appService.signUp.mockResolvedValue(accessTokenOnly);
            await expect(controller.signUp(dto, res)).resolves.toEqual(accessTokenOnly);
            expect(appService.setAuthCookies).not.toHaveBeenCalled();

            appService.signUp.mockResolvedValue(sessionTokenOnly);
            await expect(controller.signUp(dto, res)).resolves.toEqual(sessionTokenOnly);
            expect(appService.setAuthCookies).not.toHaveBeenCalled();
        });

        it('propagates service errors', async () => {
            const dto = { name: 'Jane Doe', email: 'jane@example.com', password: 'Str0ngPass!', username: 'janedoe' };
            const error = new HttpException({ message: 'User already exists' }, HttpStatus.CONFLICT);
            appService.signUp.mockRejectedValue(error);
            await expect(controller.signUp(dto, {} as Response)).rejects.toThrow(error);
            expect(appService.setAuthCookies).not.toHaveBeenCalled();
        });
    });

    describe('signIn', () => {
        it('delegates to AppService and sets auth cookies', async () => {
            const dto = { email: 'jane@example.com', password: 'Str0ngPass!' };
            const res = {} as Response;
            appService.signIn.mockResolvedValue(serviceResponse);
            await expect(controller.signIn(dto, res)).resolves.toEqual(serviceResponse);
            expect(appService.signIn).toHaveBeenCalledWith(dto);
            expect(appService.setAuthCookies).toHaveBeenCalledWith(res, serviceResponse.accessToken, serviceResponse.sessionToken);
        });

        it('propagates service errors', async () => {
            const error = new HttpException({ message: 'Invalid email or password' }, HttpStatus.UNAUTHORIZED);
            appService.signIn.mockRejectedValue(error);
            await expect(controller.signIn({ email: 'jane@example.com', password: 'wrong' }, {} as Response)).rejects.toThrow(error);
            expect(appService.setAuthCookies).not.toHaveBeenCalled();
        });

        it('does not set auth cookies when sign-in returns no tokens', async () => {
            const dto = { email: 'jane@example.com', password: 'Str0ngPass!' };
            const res = {} as Response;
            const responseWithoutTokens = { ...serviceResponse, sessionToken: undefined, accessToken: undefined };
            appService.signIn.mockResolvedValue(responseWithoutTokens as unknown as SignInResult);
            await expect(controller.signIn(dto, res)).resolves.toEqual(responseWithoutTokens);
            expect(appService.setAuthCookies).not.toHaveBeenCalled();
        });

        it('does not set auth cookies when only one token is returned', async () => {
            const dto = { email: 'jane@example.com', password: 'Str0ngPass!' };
            const res = {} as Response;
            const accessTokenOnly = { ...serviceResponse, sessionToken: undefined, accessToken: 'jwt-access-token' };
            appService.signIn.mockResolvedValue(accessTokenOnly as unknown as SignInResult);
            await expect(controller.signIn(dto, res)).resolves.toEqual(accessTokenOnly);
            expect(appService.setAuthCookies).not.toHaveBeenCalled();
        });
    });

    describe('verifyEmail', () => {
        it('delegates to AppService and sets auth cookies', async () => {
            const dto = { email: 'jane@example.com', otp: '123456' };
            const res = {} as Response;
            appService.verifyEmail.mockResolvedValue(serviceResponse);
            await expect(controller.verifyEmail(dto, res)).resolves.toEqual(serviceResponse);
            expect(appService.verifyEmail).toHaveBeenCalledWith(dto);
            expect(appService.setAuthCookies).toHaveBeenCalledWith(res, serviceResponse.accessToken, serviceResponse.sessionToken);
        });

        it('propagates service errors', async () => {
            const error = new HttpException({ message: 'Invalid OTP' }, HttpStatus.BAD_REQUEST);
            appService.verifyEmail.mockRejectedValue(error);
            await expect(controller.verifyEmail({ email: 'jane@example.com', otp: '000000' }, {} as Response)).rejects.toThrow(error);
            expect(appService.setAuthCookies).not.toHaveBeenCalled();
        });
    });

    describe('getMe', () => {
        it('delegates to AppService', async () => {
            const req = {} as import('express').Request;
            const user = {
                id: '1',
                email: 'jane@example.com',
                name: 'Jane Doe',
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                banned: false,
            };
            appService.getMe.mockResolvedValue(user);
            await expect(controller.getMe(req)).resolves.toEqual(user);
            expect(appService.getMe).toHaveBeenCalledWith(req);
        });
    });

    describe('signOut', () => {
        it('delegates to AppService', async () => {
            const req = {} as import('express').Request;
            const res = {} as Response;
            appService.signOut.mockResolvedValue({ success: true });
            await expect(controller.signOut(req, res)).resolves.toEqual({ success: true });
            expect(appService.signOut).toHaveBeenCalledWith(req, res);
        });
    });

    describe('changePassword', () => {
        it('delegates to AppService', async () => {
            const req = {} as import('express').Request;
            const dto = { currentPassword: 'OldPass123!', newPassword: 'NewPass123!', revokeOtherSessions: true };
            appService.changePassword.mockResolvedValue({ success: true });
            await expect(controller.changePassword(req, dto)).resolves.toEqual({ success: true });
            expect(appService.changePassword).toHaveBeenCalledWith(req, dto);
        });
    });

    describe('updateProfile', () => {
        it('delegates to AppService', async () => {
            const req = {} as import('express').Request;
            const dto = { name: 'Jane Doe Updated' };
            const user = {
                id: '1',
                email: 'jane@example.com',
                name: dto.name,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                banned: false,
            };
            appService.updateProfile.mockResolvedValue({ user });
            await expect(controller.updateProfile(req, dto)).resolves.toEqual({ user });
            expect(appService.updateProfile).toHaveBeenCalledWith(req, dto);
        });
    });

    describe('forgotPassword', () => {
        it('delegates to AppService', async () => {
            const dto = { email: 'jane@example.com' };
            appService.forgotPassword.mockResolvedValue({ success: true });
            await expect(controller.forgotPassword(dto)).resolves.toEqual({ success: true });
            expect(appService.forgotPassword).toHaveBeenCalledWith(dto);
        });
    });

    describe('resetPassword', () => {
        it('delegates to AppService', async () => {
            const dto = { token: 'reset-token', newPassword: 'ResetStr0ng1!' };
            appService.resetPassword.mockResolvedValue({ success: true });
            await expect(controller.resetPassword(dto)).resolves.toEqual({ success: true });
            expect(appService.resetPassword).toHaveBeenCalledWith(dto);
        });
    });
});
