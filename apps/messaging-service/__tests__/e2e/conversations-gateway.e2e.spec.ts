import { E2EApplication, MockAuthGuard, MockWsAuthGuard, requireDatabase, WsTestClient, type E2EApi } from '@tc/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import type { DataSource } from '@tc/database';
import { AppModule } from '../../src/app/app.module';

const userA = require('./fixtures/users/user-a.json') as { userId: string };
const userB = require('./fixtures/users/user-b.json') as { userId: string };

const e2eApplication = new E2EApplication({
    rootModule: AppModule,
    globalPrefix: 'api',
    authGuard: MockAuthGuard,
    wsAuthGuard: MockWsAuthGuard,
    listenUrl: 'http://127.0.0.1:0',
});

function authedApi(api: E2EApi, userId: string): E2EApi {
    return api.setHeader('Authorization', `Bearer ${userId}`);
}

describe('Conversations gateway', () => {
    let api: E2EApi;
    let client: WsTestClient;

    beforeAll(async () => {
        await e2eApplication.bootstrap();
        api = e2eApplication.getApi();
    }, 60_000);

    afterAll(async () => {
        await e2eApplication.close();
    });

    beforeEach(async () => {
        client = new WsTestClient();
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

    afterEach(() => {
        client.disconnect();
    });

    it('delivers message:new over the conversations gateway to a participant who joined', async () => {
        if (!requireDatabase('conversations gateway message:new')) return;
        const createRes = await authedApi(api, userA.userId).post('/api/v1/conversations', { participantUserId: userB.userId });
        const conversationId = createRes.body.conversation.id;
        await client.connect({ url: e2eApplication.getBaseUrl(), namespace: '/conversations', token: userB.userId });
        await client.emitWithAck('conversations:join');
        const messagePromise = client.waitForEvent<{ body: string; senderId: string }>('message:new');
        await authedApi(api, userA.userId).post(`/api/v1/conversations/${conversationId}/messages`, { body: 'Hello over websocket!' });
        const message = await messagePromise;
        expect(message.body).toBe('Hello over websocket!');
        expect(message.senderId).toBe(userA.userId);
    });

    it('rejects conversations:join with no auth token', async () => {
        if (!requireDatabase('conversations gateway auth')) return;
        await client.connect({ url: e2eApplication.getBaseUrl(), namespace: '/conversations', token: '' });
        const exceptionPromise = client.waitForEvent('exception');
        client.emitWithAck('conversations:join').catch(() => undefined);
        const error = await exceptionPromise;
        expect(error).toBeDefined();
    });
});
