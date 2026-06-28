import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedRequest } from '@tc/auth';
import { AppController } from '../../src/app/app.controller';
import { AppService } from '../../src/app/app.service';

jest.mock('@tc/auth', () => ({
    AuthGuard: class AuthGuard {},
}));

describe('AppController', () => {
    let controller: AppController;
    let appService: jest.Mocked<Pick<AppService, 'getProfile' | 'updateProfile' | 'getTravelHistory' | 'getPublicProfile'>>;

    beforeAll(async () => {
        appService = {
            getProfile: jest.fn(),
            updateProfile: jest.fn(),
            getTravelHistory: jest.fn(),
            getPublicProfile: jest.fn(),
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

    const profileResponse = {
        profile: {
            userId: 'user-1',
            avatarUrl: null,
            biography: null,
            interests: [],
            privacySettings: { showEmail: false, showTravelHistory: true },
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    };

    describe('getMyProfile', () => {
        it('delegates to AppService with the authenticated user id', async () => {
            const req = { session: { userId: 'user-1' } } as AuthenticatedRequest;
            appService.getProfile.mockResolvedValue(profileResponse);
            const result = await controller.getMyProfile(req);
            expect(appService.getProfile).toHaveBeenCalledWith('user-1');
            expect(result).toEqual(profileResponse);
        });
    });

    describe('updateMyProfile', () => {
        it('delegates to AppService with the authenticated user id and dto', async () => {
            const req = { session: { userId: 'user-1' } } as AuthenticatedRequest;
            const dto = { biography: 'Updated bio' };
            appService.updateProfile.mockResolvedValue(profileResponse);
            const result = await controller.updateMyProfile(req, dto);
            expect(appService.updateProfile).toHaveBeenCalledWith('user-1', dto);
            expect(result).toEqual(profileResponse);
        });
    });

    describe('getMyTravelHistory', () => {
        it('delegates to AppService with the authenticated user id', async () => {
            const req = { session: { userId: 'user-1' } } as AuthenticatedRequest;
            appService.getTravelHistory.mockResolvedValue({ trips: [] });
            const result = await controller.getMyTravelHistory(req);
            expect(appService.getTravelHistory).toHaveBeenCalledWith('user-1');
            expect(result).toEqual({ trips: [] });
        });
    });

    describe('getPublicProfile', () => {
        it('delegates to AppService with the requested user id', async () => {
            const publicProfile = { profile: { userId: 'user-2', name: 'Jane', username: 'jane', avatarUrl: null, biography: null, interests: [] } };
            appService.getPublicProfile.mockResolvedValue(publicProfile);
            const result = await controller.getPublicProfile('user-2');
            expect(appService.getPublicProfile).toHaveBeenCalledWith('user-2');
            expect(result).toEqual(publicProfile);
        });
    });
});
