import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AppController } from '../src/app/app.controller';
import { AppService } from '../src/app/app.service';

jest.mock('@tc/auth', () => ({
    auth: { api: {} },
}));

describe('AppController', () => {
    let controller: AppController;
    let appService: jest.Mocked<Pick<AppService, 'signUp' | 'signIn' | 'verifyEmail' | 'setAuthCookies'>>;

    beforeAll(async () => {
        appService = {
            signUp: jest.fn(),
            signIn: jest.fn(),
            verifyEmail: jest.fn(),
            setAuthCookies: jest.fn(),
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
});
