import { E2EApplication, type E2EApi } from '@tc/testing';
import { authedApi, requireDatabase, seedFixtureUser } from './support/auth-fixtures';
import { FixtureAuthGuard } from './support/fixture-auth.guard';
import { createUsersE2EAppModule } from './support/e2e-app.module';

const e2eApplication = new E2EApplication({
    rootModule: createUsersE2EAppModule(),
    globalPrefix: 'api',
    authGuard: FixtureAuthGuard,
});

describe('Profiles', () => {
    let api: E2EApi;

    beforeAll(async () => {
        await e2eApplication.bootstrap();
        api = e2eApplication.getApi();
    }, 60_000);

    afterAll(async () => {
        await e2eApplication.close();
    });

    it('GET /api/v1/profiles/me creates and returns the authenticated user profile', async () => {
        if (!requireDatabase('get my profile')) return;
        const user = await seedFixtureUser();
        const response = await authedApi(api, user).get('/api/v1/profiles/me');
        expect(response.status).toBe(200);
        expect(response.body.profile.interests).toEqual([]);
        expect(response.body.profile.biography).toBeNull();
        expect(response.body.profile.avatarUrl).toBeNull();
    });

    it('PATCH /api/v1/profiles/me updates profile fields', async () => {
        if (!requireDatabase('update my profile')) return;
        const user = await seedFixtureUser();
        const client = authedApi(api, user);
        const body = { biography: 'Road trip enthusiast', interests: ['Hiking', 'Road Trips'], avatarUrl: 'https://cdn.touring.club/avatars/e2e.png' };
        const response = await client.patch('/api/v1/profiles/me', body);
        expect(response.status).toBe(200);
        expect(response.body.profile.biography).toBe('Road trip enthusiast');
        expect(response.body.profile.interests).toEqual(['Hiking', 'Road Trips']);
        expect(response.body.profile.avatarUrl).toBe('https://cdn.touring.club/avatars/e2e.png');
    });

    it('GET /api/v1/profiles/me/travel-history returns an empty trip list until trips-service exists', async () => {
        if (!requireDatabase('travel history')) return;
        const user = await seedFixtureUser();
        const response = await authedApi(api, user).get('/api/v1/profiles/me/travel-history');
        expect(response.status).toBe(200);
        expect(response.body.trips).toEqual([]);
    });

    it('GET /api/v1/profiles/:userId returns a public profile without email by default', async () => {
        if (!requireDatabase('public profile')) return;
        const user = await seedFixtureUser();
        const viewer = await seedFixtureUser();
        const response = await authedApi(api, viewer).get(`/api/v1/profiles/${user.userId}`);
        expect(response.status).toBe(200);
        expect(response.body.profile.userId).toBe(user.userId);
        expect(response.body.profile.email).toBeUndefined();
        expect(response.body.profile.travelHistory).toEqual({ trips: [] });
    });

    it('GET /api/v1/profiles/:userId includes email when showEmail privacy is enabled', async () => {
        if (!requireDatabase('public profile email privacy')) return;
        const user = await seedFixtureUser();
        const client = authedApi(api, user);
        await client.patch('/api/v1/profiles/me', { privacySettings: { showEmail: true } });
        const viewer = await seedFixtureUser();
        const response = await authedApi(api, viewer).get(`/api/v1/profiles/${user.userId}`);
        expect(response.status).toBe(200);
        expect(response.body.profile.email).toBe(user.email);
    });

    it('GET /api/v1/profiles/:userId returns 404 for an unknown user', async () => {
        if (!requireDatabase('public profile not found')) return;
        const viewer = await seedFixtureUser();
        const response = await authedApi(api, viewer).get('/api/v1/profiles/nonexistent-user-id');
        expect(response.status).toBe(404);
    });
});
