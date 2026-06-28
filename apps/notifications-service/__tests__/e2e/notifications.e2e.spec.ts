import { E2EApplication, FixtureAuthGuard, requireDatabase, type E2EApi } from '@tc/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import type { DataSource } from '@tc/database';
import { AppModule } from '../../src/app/app.module';

const userA = require('./fixtures/users/user-a.json') as { userId: string };
const userB = require('./fixtures/users/user-b.json') as { userId: string };

const e2eApplication = new E2EApplication({
    rootModule: AppModule,
    globalPrefix: 'api',
    authGuard: FixtureAuthGuard,
});

function authedApi(api: E2EApi, userId: string): E2EApi {
    return api.setHeader('Authorization', `Bearer ${userId}`);
}

async function seedNotification(dataSource: DataSource, userId: string, title: string, body: string | null = null) {
    const rows = await dataSource.query(
        `INSERT INTO general.notifications (user_id, type, title, body)
         VALUES ($1, 'new_message', $2, $3)
         RETURNING id`,
        [userId, title, body],
    );
    return rows[0].id as string;
}

describe('Notifications', () => {
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
        await dataSource.query(`DELETE FROM general.notifications WHERE user_id = ANY($1)`, [[userA.userId, userB.userId]]);
    });

    it('GET /api/v1/notifications lists notifications for the authenticated user', async () => {
        if (!requireDatabase('list notifications')) return;
        const dataSource = e2eApplication.getApp().get<DataSource>(getDataSourceToken());
        await seedNotification(dataSource, userA.userId, 'Trip approved', 'Your request was approved.');
        await seedNotification(dataSource, userB.userId, 'Other user notification');
        const response = await authedApi(api, userA.userId).get('/api/v1/notifications');
        expect(response.status).toBe(200);
        expect(response.body.notifications).toHaveLength(1);
        expect(response.body.notifications[0].title).toBe('Trip approved');
        expect(response.body.notifications[0].readAt).toBeNull();
    });

    it('PATCH /api/v1/notifications/:id/read marks a notification as read', async () => {
        if (!requireDatabase('mark notification read')) return;
        const dataSource = e2eApplication.getApp().get<DataSource>(getDataSourceToken());
        const notificationId = await seedNotification(dataSource, userA.userId, 'New message', 'Hello!');
        const response = await authedApi(api, userA.userId).patch(`/api/v1/notifications/${notificationId}/read`);
        expect(response.status).toBe(200);
        expect(response.body.notification.readAt).not.toBeNull();
    });

    it('PATCH /api/v1/notifications/:id/read returns 404 for another user notification', async () => {
        if (!requireDatabase('mark notification forbidden')) return;
        const dataSource = e2eApplication.getApp().get<DataSource>(getDataSourceToken());
        const notificationId = await seedNotification(dataSource, userB.userId, 'Private notification');
        const response = await authedApi(api, userA.userId).patch(`/api/v1/notifications/${notificationId}/read`);
        expect(response.status).toBe(404);
    });
});
