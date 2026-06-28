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

describe('Conversations', () => {
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
        await dataSource.query(
            `DELETE FROM general.messages WHERE conversation_id IN (
                SELECT conversation_id FROM general.conversation_participants WHERE user_id = ANY($1)
            )`,
            [[userA.userId, userB.userId]],
        );
        await dataSource.query(`DELETE FROM general.conversation_participants WHERE user_id = ANY($1)`, [[userA.userId, userB.userId]]);
        await dataSource.query(
            `DELETE FROM general.conversations WHERE id NOT IN (
                SELECT conversation_id FROM general.conversation_participants
            )`,
        );
    });

    it('POST /api/v1/conversations creates a direct conversation', async () => {
        if (!requireDatabase('create conversation')) return;
        const response = await authedApi(api, userA.userId).post('/api/v1/conversations', { participantUserId: userB.userId });
        expect(response.status).toBe(201);
        expect(response.body.conversation.type).toBe('direct');
    });

    it('POST /api/v1/conversations returns the existing direct conversation', async () => {
        if (!requireDatabase('idempotent conversation')) return;
        const first = await authedApi(api, userA.userId).post('/api/v1/conversations', { participantUserId: userB.userId });
        const second = await authedApi(api, userB.userId).post('/api/v1/conversations', { participantUserId: userA.userId });
        expect(second.status).toBe(201);
        expect(second.body.conversation.id).toBe(first.body.conversation.id);
    });

    it('GET /api/v1/conversations lists conversations for the authenticated user', async () => {
        if (!requireDatabase('list conversations')) return;
        await authedApi(api, userA.userId).post('/api/v1/conversations', { participantUserId: userB.userId });
        const response = await authedApi(api, userA.userId).get('/api/v1/conversations');
        expect(response.status).toBe(200);
        expect(response.body.conversations).toHaveLength(1);
        expect(response.body.conversations[0].type).toBe('direct');
    });

    it('POST /api/v1/conversations/:id/messages sends a text message', async () => {
        if (!requireDatabase('send message')) return;
        const createRes = await authedApi(api, userA.userId).post('/api/v1/conversations', { participantUserId: userB.userId });
        const conversationId = createRes.body.conversation.id;
        const response = await authedApi(api, userA.userId).post(`/api/v1/conversations/${conversationId}/messages`, { body: 'Hello there!' });
        expect(response.status).toBe(201);
        expect(response.body.message.body).toBe('Hello there!');
        expect(response.body.message.senderId).toBe(userA.userId);
    });

    it('GET /api/v1/conversations/:id/messages returns messages for a participant', async () => {
        if (!requireDatabase('list messages')) return;
        const createRes = await authedApi(api, userA.userId).post('/api/v1/conversations', { participantUserId: userB.userId });
        const conversationId = createRes.body.conversation.id;
        await authedApi(api, userA.userId).post(`/api/v1/conversations/${conversationId}/messages`, { body: 'Hello there!' });
        const response = await authedApi(api, userB.userId).get(`/api/v1/conversations/${conversationId}/messages`);
        expect(response.status).toBe(200);
        expect(response.body.messages).toHaveLength(1);
        expect(response.body.messages[0].body).toBe('Hello there!');
    });

    it('GET /api/v1/conversations/:id/messages returns 404 for a non-participant', async () => {
        if (!requireDatabase('messages forbidden')) return;
        const createRes = await authedApi(api, userA.userId).post('/api/v1/conversations', { participantUserId: userB.userId });
        const conversationId = createRes.body.conversation.id;
        const response = await authedApi(api, 'e2e-msg-outsider').get(`/api/v1/conversations/${conversationId}/messages`);
        expect(response.status).toBe(404);
    });

    it('GET /api/v1/conversations requires authentication', async () => {
        const response = await api.get('/api/v1/conversations', {});
        expect(response.status).toBe(401);
    });
});
