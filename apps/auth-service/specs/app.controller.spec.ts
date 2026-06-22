jest.mock('@tc/auth', () => ({
    auth: { api: {} },
}));

jest.mock('better-auth/node', () => ({
    fromNodeHeaders: jest.fn(() => new Headers()),
}));

import { Test, TestingModule } from '@nestjs/testing';
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

    it('delegates signUp to AppService', async () => {
        const dto = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'Str0ngPass!',
            username: 'janedoe',
        };
        const req = { headers: {} } as never;
        const res = {} as never;
        const response = { token: null, user: { id: '1', email: dto.email } };

        appService.signUp.mockResolvedValue(response);

        await expect(controller.signUp(dto, req, res)).resolves.toEqual(response);
        expect(appService.signUp).toHaveBeenCalledWith(dto, req.headers, res);
    });

    it('delegates signIn to AppService', async () => {
        const dto = { email: 'jane@example.com', password: 'Str0ngPass!' };
        const req = { headers: {} } as never;
        const res = {} as never;
        const response = { redirect: false, token: 'token', user: { id: '1', email: dto.email } };

        appService.signIn.mockResolvedValue(response);

        await expect(controller.signIn(dto, req, res)).resolves.toEqual(response);
        expect(appService.signIn).toHaveBeenCalledWith(dto, req.headers, res);
    });

    it('delegates verifyEmail to AppService', async () => {
        const dto = { email: 'jane@example.com', otp: '123456' };
        const req = { headers: {} } as never;
        const res = {} as never;
        const response = { status: true, token: 'token', user: { id: '1', email: dto.email } };

        appService.verifyEmail.mockResolvedValue(response);

        await expect(controller.verifyEmail(dto, req, res)).resolves.toEqual(response);
        expect(appService.verifyEmail).toHaveBeenCalledWith(dto, req.headers, res);
    });
});
