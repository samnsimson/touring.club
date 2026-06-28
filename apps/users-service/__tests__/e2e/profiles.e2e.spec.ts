import { E2EApplication, FixtureAuthGuard, requireDatabase, type E2EApi } from '@tc/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import type { DataSource } from '@tc/database';
import { AppModule } from '../../src/app/app.module';

const defaultUser = require('./fixtures/users/default-user.json') as { userId: string; name: string; email: string; username: string };
const viewerUser = require('./fixtures/users/viewer-user.json') as { userId: string; name: string; email: string; username: string };

const fixtureUsers: Record<string, { id: string; name: string; email: string; username: string; emailVerified: boolean; image: null }> = {
    [defaultUser.userId]: { id: defaultUser.userId, ...defaultUser, emailVerified: true, image: null },
    [viewerUser.userId]: { id: viewerUser.userId, ...viewerUser, emailVerified: true, image: null },
};

const mockFindById = jest.fn(async (id: string) => fixtureUsers[id] ?? null);

jest.mock('../../src/app/repositories/user.repository', () => ({
    UserRepository: jest.fn().mockImplementation(() => ({ findById: mockFindById })),
}));

const e2eApplication = new E2EApplication({
    rootModule: AppModule,
    globalPrefix: 'api',
    authGuard: FixtureAuthGuard,
});

function authedApi(api: E2EApi, userId: string): E2EApi {
    return api.setHeader('Authorization', `Bearer ${userId}`);
}

describe('Profiles', () => {
    let api: E2EApi;

    beforeAll(async () => {
        await e2eApplication.bootstrap();
        api = e2eApplication.getApi();
    }, 60_000);

    afterAll(async () => {
        await e2eApplication.close();
    });

    beforeEach(async () => {
        if (!process.env.DATABASE_URL) return;
        const dataSource = e2eApplication.getApp().get<DataSource>(getDataSourceToken());
        await dataSource.query('DELETE FROM general.profiles WHERE user_id = ANY($1)', [[defaultUser.userId, viewerUser.userId]]);
    });

    it('GET /api/v1/profiles/me creates and returns the authenticated user profile', async () => {
        if (!requireDatabase('get my profile')) return;
        const response = await authedApi(api, defaultUser.userId).get('/api/v1/profiles/me');
        expect(response.status).toBe(200);
        expect(response.body.profile.interests).toEqual([]);
        expect(response.body.profile.biography).toBeNull();
        expect(response.body.profile.avatarUrl).toBeNull();
    });

    it('PATCH /api/v1/profiles/me updates profile fields', async () => {
        if (!requireDatabase('update my profile')) return;
        const client = authedApi(api, defaultUser.userId);
        const body = { biography: 'Road trip enthusiast', interests: ['Hiking', 'Road Trips'], avatarUrl: 'https://cdn.touring.club/avatars/e2e.png' };
        const response = await client.patch('/api/v1/profiles/me', body);
        expect(response.status).toBe(200);
        expect(response.body.profile.biography).toBe('Road trip enthusiast');
        expect(response.body.profile.interests).toEqual(['Hiking', 'Road Trips']);
        expect(response.body.profile.avatarUrl).toBe('https://cdn.touring.club/avatars/e2e.png');
    });

    it('GET /api/v1/profiles/me/travel-history returns an empty trip list until trips-service exists', async () => {
        if (!requireDatabase('travel history')) return;
        const response = await authedApi(api, defaultUser.userId).get('/api/v1/profiles/me/travel-history');
        expect(response.status).toBe(200);
        expect(response.body.trips).toEqual([]);
    });

    it('GET /api/v1/profiles/:userId returns a public profile without email by default', async () => {
        if (!requireDatabase('public profile')) return;
        const response = await authedApi(api, viewerUser.userId).get(`/api/v1/profiles/${defaultUser.userId}`);
        expect(response.status).toBe(200);
        expect(response.body.profile.userId).toBe(defaultUser.userId);
        expect(response.body.profile.email).toBeUndefined();
        expect(response.body.profile.travelHistory).toEqual({ trips: [] });
    });

    it('GET /api/v1/profiles/:userId includes email when showEmail privacy is enabled', async () => {
        if (!requireDatabase('public profile email privacy')) return;
        const owner = authedApi(api, defaultUser.userId);
        await owner.patch('/api/v1/profiles/me', { privacySettings: { showEmail: true } });
        const response = await authedApi(api, viewerUser.userId).get(`/api/v1/profiles/${defaultUser.userId}`);
        expect(response.status).toBe(200);
        expect(response.body.profile.email).toBe(defaultUser.email);
    });

    it('GET /api/v1/profiles/:userId returns 404 for an unknown user', async () => {
        if (!requireDatabase('public profile not found')) return;
        const response = await authedApi(api, viewerUser.userId).get('/api/v1/profiles/nonexistent-user-id');
        expect(response.status).toBe(404);
    });
});
