import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { E2EApi, MockEmailService, RequestFixtureLoader, SnapshotRedactor } from './testing';

describe('RequestFixtureLoader', () => {
    it('loads a request fixture from disk', () => {
        const fixturesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-request-fixtures-'));
        fs.writeFileSync(path.join(fixturesDir, 'sign-up.request.json'), JSON.stringify({ email: 'a@b.test' }), 'utf8');
        const loader = new RequestFixtureLoader({ fixturesDir });
        expect(loader.load<{ email: string }>('sign-up')).toEqual({ email: 'a@b.test' });
    });

    it('throws when a fixture file is missing', () => {
        const fixturesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-request-fixtures-'));
        const loader = new RequestFixtureLoader({ fixturesDir });
        expect(() => loader.load('missing')).toThrow('Request fixture "missing" not found');
    });
});

describe('SnapshotRedactor', () => {
    it('redacts default dynamic fields', () => {
        const redactor = new SnapshotRedactor();
        const result = redactor.redact({ id: 'user-1', accessToken: 'secret', profile: { email: 'a@b.test' } });
        expect(result.id).toBe('[redacted]');
        expect(result.accessToken).toBe('[redacted]');
        expect(result.profile.email).toBe('[redacted]');
    });

    it('respects a custom key list', () => {
        const redactor = new SnapshotRedactor({ keys: ['token'] });
        const result = redactor.redact({ token: 'abc', email: 'a@b.test' });
        expect(result.token).toBe('[redacted]');
        expect(result.email).toBe('a@b.test');
    });
});

describe('MockEmailService', () => {
    it('extracts otp and reset tokens from email text', () => {
        const mailbox = new MockEmailService();
        expect(mailbox.extractOtp('Your verification code is 123456.')).toBe('123456');
        expect(mailbox.extractResetToken('Or enter this token: reset-token-abc')).toBe('reset-token-abc');
    });

    it('stores sent emails and waits for matching messages', async () => {
        const mailbox = new MockEmailService({ pollIntervalMs: 25, pollTimeoutMs: 1_000 });

        setTimeout(() => {
            mailbox.send({
                to: 'user@example.com',
                subject: 'Your Touring Club verification code',
                text: 'Your verification code is 654321.',
            });
        }, 50);

        expect(mailbox.readAll()).toEqual([]);
        const email = await mailbox.waitFor({ to: 'user@example.com', subjectIncludes: 'verification code' });
        expect(email.text).toContain('654321');
        expect(mailbox.find({ to: 'user@example.com' })).toEqual(email);
    });

    it('clears stored emails and mock call history', () => {
        const mailbox = new MockEmailService();
        mailbox.send({ to: 'user@example.com', subject: 'Test', text: 'Hello' });
        mailbox.clear();
        expect(mailbox.readAll()).toEqual([]);
        expect(mailbox.send).not.toHaveBeenCalled();
    });
});

describe('E2EApi', () => {
    let server: http.Server;
    let baseUrl: string;

    beforeEach(async () => {
        server = http.createServer((req, res) => {
            if (req.method === 'GET' && req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok' }));
                return;
            }

            if (req.method === 'POST' && req.url === '/echo') {
                let body = '';
                req.on('data', (chunk) => (body += chunk));
                req.on('end', () => {
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ received: JSON.parse(body), authorization: req.headers.authorization ?? null }));
                });
                return;
            }

            res.writeHead(404).end();
        });

        await new Promise<void>((resolve) => server.listen(0, resolve));
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected server to listen on a port');
        baseUrl = `http://127.0.0.1:${address.port}`;
    });

    afterEach(async () => {
        await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    });

    it('exposes composed testing helpers', () => {
        const api = new E2EApi({ server: baseUrl });
        expect(api.fixtureLoader).toBeInstanceOf(RequestFixtureLoader);
        expect(api.snapshotRedactor).toBeInstanceOf(SnapshotRedactor);
    });

    it('sends GET requests through supertest', async () => {
        const api = new E2EApi({ server: baseUrl });
        const response = await api.get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });

    it('sends POST requests with headers and body', async () => {
        const api = new E2EApi({ server: baseUrl }).setHeader('Authorization', 'Bearer test-token');
        const response = await api.post('/echo', { email: 'a@b.test' });
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ received: { email: 'a@b.test' }, authorization: 'Bearer test-token' });
    });
});
