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

import { Test } from '@nestjs/testing';
import { auth } from '@tc/auth';
import { AppService } from '../src/app/app.service';

describe('AppService', () => {
    let service: AppService;
    const authApi = auth.api as jest.Mocked<typeof auth.api>;

    beforeAll(async () => {
        const app = await Test.createTestingModule({
            providers: [AppService],
        }).compile();

        service = app.get<AppService>(AppService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('signUp forwards Better Auth response and cookies', async () => {
        const headers = new Headers({ 'set-cookie': 'session=abc' });
        const response = { token: null, user: { id: '1', email: 'jane@example.com' } };
        authApi.signUpEmail.mockResolvedValue({ headers, response } as never);

        const res = { append: jest.fn(), setHeader: jest.fn() } as never;
        const dto = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'Str0ngPass!',
            username: 'janedoe',
        };

        await expect(service.signUp(dto, {}, res)).resolves.toEqual(response);
        expect(res.append).toHaveBeenCalledWith('Set-Cookie', 'session=abc');
    });

    it('signIn forwards Better Auth response and cookies', async () => {
        const headers = new Headers();
        const response = { redirect: false, token: 'token', user: { id: '1', email: 'jane@example.com' } };
        authApi.signInEmail.mockResolvedValue({ headers, response } as never);

        const res = { append: jest.fn(), setHeader: jest.fn() } as never;

        await expect(service.signIn({ email: 'jane@example.com', password: 'Str0ngPass!' }, {}, res)).resolves.toEqual(response);
    });

    it('verifyEmail forwards Better Auth response and cookies', async () => {
        const headers = new Headers();
        const response = { status: true, token: 'token', user: { id: '1', email: 'jane@example.com' } };
        authApi.verifyEmailOTP.mockResolvedValue({ headers, response } as never);

        const res = { append: jest.fn(), setHeader: jest.fn() } as never;

        await expect(service.verifyEmail({ email: 'jane@example.com', otp: '123456' }, {}, res)).resolves.toEqual(response);
    });
});
