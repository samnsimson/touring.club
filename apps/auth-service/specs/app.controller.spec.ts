jest.mock('@tc/auth', () => ({
    auth: { api: {} },
}));

jest.mock('better-auth/node', () => ({
    fromNodeHeaders: jest.fn(() => new Headers()),
}));

import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type * as express from 'express';
import { AppController } from '../src/app/app.controller';
import { AppService } from '../src/app/app.service';

describe('AppController', () => {
    let controller: AppController;
    let appService: jest.Mocked<Pick<AppService, 'signUp' | 'signIn' | 'verifyEmail'>>;

    beforeAll(async () => {
        appService = {
            signUp: jest.fn(),
            signIn: jest.fn(),
            verifyEmail: jest.fn(),
        };

        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [{ provide: AppService, useValue: appService }],
        }).compile();

        controller = app.get<AppController>(AppController);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('signUp', () => {
        it('delegates to AppService with request headers and response', async () => {
            const dto = {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'Str0ngPass!',
                username: 'janedoe',
            };
            const req = { headers: { 'user-agent': 'jest' } } as unknown as express.Request;
            const res = {} as unknown as express.Response;
            const response = { token: null, user: { id: '1', email: dto.email } };

            appService.signUp.mockResolvedValue(response as never);

            await expect(controller.signUp(dto, req, res)).resolves.toEqual(response);
            expect(appService.signUp).toHaveBeenCalledWith(dto, req.headers, res);
        });

        it('propagates service errors', async () => {
            const dto = {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'Str0ngPass!',
                username: 'janedoe',
            };
            const error = new HttpException({ message: 'User already exists' }, HttpStatus.CONFLICT);

            appService.signUp.mockRejectedValue(error);

            await expect(controller.signUp(dto, { headers: {} } as unknown as express.Request, {} as unknown as express.Response)).rejects.toThrow(error);
        });
    });

    describe('signIn', () => {
        it('delegates to AppService with request headers and response', async () => {
            const dto = { email: 'jane@example.com', password: 'Str0ngPass!' };
            const req = { headers: { cookie: 'session=abc' } } as unknown as express.Request;
            const res = {} as unknown as express.Response;
            const response = { redirect: false, token: 'token', user: { id: '1', email: dto.email } };

            appService.signIn.mockResolvedValue(response as never);

            await expect(controller.signIn(dto, req, res)).resolves.toEqual(response);
            expect(appService.signIn).toHaveBeenCalledWith(dto, req.headers, res);
        });

        it('propagates service errors', async () => {
            const error = new HttpException({ message: 'Invalid email or password' }, HttpStatus.UNAUTHORIZED);

            appService.signIn.mockRejectedValue(error);

            await expect(
                controller.signIn(
                    { email: 'jane@example.com', password: 'wrong' },
                    { headers: {} } as unknown as express.Request,
                    {} as unknown as express.Response,
                ),
            ).rejects.toThrow(error);
        });
    });

    describe('verifyEmail', () => {
        it('delegates to AppService with request headers and response', async () => {
            const dto = { email: 'jane@example.com', otp: '123456' };
            const req = { headers: { 'x-forwarded-for': '127.0.0.1' } } as unknown as express.Request;
            const res = {} as unknown as express.Response;
            const response = { status: true, token: 'token', user: { id: '1', email: dto.email } };

            appService.verifyEmail.mockResolvedValue(response as never);

            await expect(controller.verifyEmail(dto, req, res)).resolves.toEqual(response);
            expect(appService.verifyEmail).toHaveBeenCalledWith(dto, req.headers, res);
        });

        it('propagates service errors', async () => {
            const error = new HttpException({ message: 'Invalid OTP' }, HttpStatus.BAD_REQUEST);

            appService.verifyEmail.mockRejectedValue(error);

            await expect(
                controller.verifyEmail(
                    { email: 'jane@example.com', otp: '000000' },
                    { headers: {} } as unknown as express.Request,
                    {} as unknown as express.Response,
                ),
            ).rejects.toThrow(error);
        });
    });
});
