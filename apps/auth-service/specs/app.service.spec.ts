import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { auth } from '@tc/auth';
import { fromNodeHeaders } from 'better-auth/node';
import type { Response } from 'express';
import { AppService } from '../src/app/app.service';

type AuthApiMock = {
    signUpEmail: jest.Mock;
    signInEmail: jest.Mock;
    verifyEmailOTP: jest.Mock;
};

const createMockResponse = (): jest.Mocked<Pick<Response, 'append' | 'setHeader'>> => ({
    append: jest.fn(),
    setHeader: jest.fn(),
});

jest.mock('@tc/auth', () => ({
    auth: {
        api: {
            signUpEmail: jest.fn(),
            signInEmail: jest.fn(),
            verifyEmailOTP: jest.fn(),
        },
    },
}));

jest.mock('better-auth/node', () => ({
    fromNodeHeaders: jest.fn(() => new Headers()),
}));

describe('AppService', () => {
    let service: AppService;
    const authApi = auth.api as unknown as AuthApiMock;
    const mockFromNodeHeaders = fromNodeHeaders as jest.MockedFunction<typeof fromNodeHeaders>;

    beforeAll(async () => {
        const app = await Test.createTestingModule({ providers: [AppService] }).compile();
        service = app.get<AppService>(AppService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockFromNodeHeaders.mockReturnValue(new Headers());
    });

    describe('signUp', () => {
        const dto = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'Str0ngPass!',
            username: 'janedoe',
        };

        it('forwards Better Auth response and cookies', async () => {
            const incomingHeaders = { authorization: 'Bearer token' };
            const nodeHeaders = new Headers({ 'x-test': '1' });
            const responseHeaders = new Headers({ 'set-cookie': 'session=abc' });
            const response = { token: null, user: { id: '1', email: dto.email } };

            mockFromNodeHeaders.mockReturnValue(nodeHeaders);
            authApi.signUpEmail.mockResolvedValue({ headers: responseHeaders, response });

            const res = createMockResponse();

            await expect(service.signUp(dto, incomingHeaders, res as unknown as Response)).resolves.toEqual(response);
            expect(mockFromNodeHeaders).toHaveBeenCalledWith(incomingHeaders);
            expect(authApi.signUpEmail).toHaveBeenCalledWith({ body: dto, headers: nodeHeaders, returnHeaders: true });
            expect(res.append).toHaveBeenCalledWith('Set-Cookie', 'session=abc');
        });

        it('maps Better Auth errors to HttpException', async () => {
            authApi.signUpEmail.mockRejectedValue({ message: 'User already exists', status: 'USER_ALREADY_EXISTS', statusCode: HttpStatus.CONFLICT });
            const res = createMockResponse();
            await expect(service.signUp(dto, {}, res as unknown as Response)).rejects.toMatchObject({
                response: { message: 'User already exists', code: 'USER_ALREADY_EXISTS' },
                status: HttpStatus.CONFLICT,
            });
        });
    });

    describe('signIn', () => {
        const dto = { email: 'jane@example.com', password: 'Str0ngPass!' };

        it('forwards Better Auth response', async () => {
            const response = { redirect: false, token: 'token', user: { id: '1', email: dto.email } };
            authApi.signInEmail.mockResolvedValue({ headers: new Headers(), response });
            const res = createMockResponse();
            await expect(service.signIn(dto, {}, res as unknown as Response)).resolves.toEqual(response);
            expect(authApi.signInEmail).toHaveBeenCalledWith({ body: dto, headers: expect.any(Headers), returnHeaders: true });
        });

        it('maps unauthorized errors to HttpException', async () => {
            authApi.signInEmail.mockRejectedValue({
                message: 'Invalid email or password',
                status: 'INVALID_EMAIL_OR_PASSWORD',
                statusCode: HttpStatus.UNAUTHORIZED,
            });
            const res = createMockResponse();
            await expect(service.signIn(dto, {}, res as unknown as Response)).rejects.toBeInstanceOf(HttpException);
        });
    });

    describe('verifyEmail', () => {
        const dto = { email: 'jane@example.com', otp: '123456' };

        it('forwards Better Auth response', async () => {
            const response = { status: true, token: 'token', user: { id: '1', email: dto.email } };
            authApi.verifyEmailOTP.mockResolvedValue({ headers: new Headers(), response });
            const res = createMockResponse();
            await expect(service.verifyEmail(dto, {}, res as unknown as Response)).resolves.toEqual(response);
            expect(authApi.verifyEmailOTP).toHaveBeenCalledWith({ body: dto, headers: expect.any(Headers), returnHeaders: true });
        });

        it('maps invalid otp errors to HttpException', async () => {
            authApi.verifyEmailOTP.mockRejectedValue({ message: 'Invalid OTP', status: 'INVALID_OTP', statusCode: HttpStatus.BAD_REQUEST });
            const res = createMockResponse();
            await expect(service.verifyEmail(dto, {}, res as unknown as Response)).rejects.toMatchObject({
                response: { message: 'Invalid OTP', code: 'INVALID_OTP' },
                status: HttpStatus.BAD_REQUEST,
            });
        });
    });
});
