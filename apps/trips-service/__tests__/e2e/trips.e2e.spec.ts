import { E2EApplication, FixtureAuthGuard, requireDatabase, type E2EApi } from '@tc/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import type { DataSource } from '@tc/database';
import { AppModule } from '../../src/app/app.module';

const organizer = require('./fixtures/users/organizer.json') as { userId: string };

const e2eApplication = new E2EApplication({
    rootModule: AppModule,
    globalPrefix: 'api',
    authGuard: FixtureAuthGuard,
});

function authedApi(api: E2EApi, userId: string): E2EApi {
    return api.setHeader('Authorization', `Bearer ${userId}`);
}

describe('Trips', () => {
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
        await dataSource.query('DELETE FROM general.trips WHERE organizer_id = $1', [organizer.userId]);
    });

    it('POST /api/v1/trips creates a trip for the authenticated organizer', async () => {
        if (!requireDatabase('create trip')) return;
        const body = {
            title: 'Pacific Coast Highway',
            destination: 'California, USA',
            startDate: '2026-07-01T09:00:00.000Z',
            endDate: '2026-07-07T18:00:00.000Z',
            capacity: 12,
            visibility: 'public',
        };
        const response = await authedApi(api, organizer.userId).post('/api/v1/trips', body);
        expect(response.status).toBe(201);
        expect(response.body.trip.title).toBe('Pacific Coast Highway');
        expect(response.body.trip.organizerId).toBe(organizer.userId);
        expect(response.body.trip.status).toBe('draft');
    });

    it('GET /api/v1/trips returns trips created by the authenticated organizer', async () => {
        if (!requireDatabase('list trips')) return;
        const client = authedApi(api, organizer.userId);
        const body = {
            title: 'Desert Loop',
            destination: 'Arizona, USA',
            startDate: '2026-08-01T09:00:00.000Z',
            endDate: '2026-08-05T18:00:00.000Z',
            capacity: 8,
            visibility: 'private',
        };
        await client.post('/api/v1/trips', body);
        const response = await client.get('/api/v1/trips');
        expect(response.status).toBe(200);
        expect(response.body.trips).toHaveLength(1);
        expect(response.body.trips[0].title).toBe('Desert Loop');
    });

    it('POST /api/v1/trips validates request body', async () => {
        const response = await authedApi(api, organizer.userId).post('/api/v1/trips', { title: 'Missing fields' });
        expect(response.status).toBe(400);
    });

    it('GET /api/v1/trips requires authentication', async () => {
        const response = await api.get('/api/v1/trips', {});
        expect(response.status).toBe(401);
    });

    it('GET /api/v1/trips/:tripId returns an owned trip', async () => {
        if (!requireDatabase('get trip')) return;
        const client = authedApi(api, organizer.userId);
        const createRes = await client.post('/api/v1/trips', {
            title: 'Coastal Drive',
            destination: 'California, USA',
            startDate: '2026-07-01T09:00:00.000Z',
            endDate: '2026-07-07T18:00:00.000Z',
            capacity: 12,
            visibility: 'public',
        });
        const response = await client.get(`/api/v1/trips/${createRes.body.trip.id}`);
        expect(response.status).toBe(200);
        expect(response.body.trip.title).toBe('Coastal Drive');
    });

    it('PATCH /api/v1/trips/:tripId updates an owned trip', async () => {
        if (!requireDatabase('update trip')) return;
        const client = authedApi(api, organizer.userId);
        const createRes = await client.post('/api/v1/trips', {
            title: 'Coastal Drive',
            destination: 'California, USA',
            startDate: '2026-07-01T09:00:00.000Z',
            endDate: '2026-07-07T18:00:00.000Z',
            capacity: 12,
            visibility: 'public',
        });
        const response = await client.patch(`/api/v1/trips/${createRes.body.trip.id}`, { title: 'Updated Coastal Drive' });
        expect(response.status).toBe(200);
        expect(response.body.trip.title).toBe('Updated Coastal Drive');
    });

    it('POST /api/v1/trips/:tripId/publish publishes a draft trip', async () => {
        if (!requireDatabase('publish trip')) return;
        const client = authedApi(api, organizer.userId);
        const createRes = await client.post('/api/v1/trips', {
            title: 'Coastal Drive',
            destination: 'California, USA',
            startDate: '2026-07-01T09:00:00.000Z',
            endDate: '2026-07-07T18:00:00.000Z',
            capacity: 12,
            visibility: 'public',
        });
        const response = await client.post(`/api/v1/trips/${createRes.body.trip.id}/publish`);
        expect(response.status).toBe(200);
        expect(response.body.trip.status).toBe('published');
    });

    it('POST /api/v1/trips/:tripId/cancel cancels a published trip', async () => {
        if (!requireDatabase('cancel trip')) return;
        const client = authedApi(api, organizer.userId);
        const createRes = await client.post('/api/v1/trips', {
            title: 'Coastal Drive',
            destination: 'California, USA',
            startDate: '2026-07-01T09:00:00.000Z',
            endDate: '2026-07-07T18:00:00.000Z',
            capacity: 12,
            visibility: 'public',
        });
        await client.post(`/api/v1/trips/${createRes.body.trip.id}/publish`);
        const response = await client.post(`/api/v1/trips/${createRes.body.trip.id}/cancel`);
        expect(response.status).toBe(200);
        expect(response.body.trip.status).toBe('cancelled');
    });

    it('POST /api/v1/trips/:tripId/archive archives a cancelled trip', async () => {
        if (!requireDatabase('archive trip')) return;
        const client = authedApi(api, organizer.userId);
        const createRes = await client.post('/api/v1/trips', {
            title: 'Coastal Drive',
            destination: 'California, USA',
            startDate: '2026-07-01T09:00:00.000Z',
            endDate: '2026-07-07T18:00:00.000Z',
            capacity: 12,
            visibility: 'public',
        });
        await client.post(`/api/v1/trips/${createRes.body.trip.id}/publish`);
        await client.post(`/api/v1/trips/${createRes.body.trip.id}/cancel`);
        const response = await client.post(`/api/v1/trips/${createRes.body.trip.id}/archive`);
        expect(response.status).toBe(200);
        expect(response.body.trip.status).toBe('archived');
    });
});
