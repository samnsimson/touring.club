import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { E2EApi, EmailCapture, RequestFixtureLoader, SnapshotRedactor } from './testing';

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

describe('EmailCapture', () => {
    it('extracts otp and reset tokens from email text', () => {
        const capture = new EmailCapture();
        expect(capture.extractOtp('Your verification code is 123456.')).toBe('123456');
        expect(capture.extractResetToken('Or enter this token: reset-token-abc')).toBe('reset-token-abc');
    });

    it('reads, finds, and waits for captured emails', async () => {
        const captureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-email-capture-'));
        const capture = new EmailCapture({ captureDir, pollIntervalMs: 25, pollTimeoutMs: 1_000 });
        capture.clear();

        setTimeout(() => {
            fs.writeFileSync(
                path.join(captureDir, `${Date.now()}-email.json`),
                JSON.stringify({
                    to: 'user@example.com',
                    subject: 'Your Touring Club verification code',
                    text: 'Your verification code is 654321.',
                    capturedAt: new Date().toISOString(),
                }),
                'utf8',
            );
        }, 50);

        expect(capture.readAll()).toEqual([]);
        const email = await capture.waitFor({ to: 'user@example.com', subjectIncludes: 'verification code' });
        expect(email.text).toContain('654321');
        expect(capture.find({ to: 'user@example.com' })).toEqual(email);
    });

    it('resolves relative capture directories against the cwd', () => {
        expect(EmailCapture.resolveCaptureDir('.tmp/custom-capture')).toBe(path.resolve(process.cwd(), '.tmp/custom-capture'));
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
        expect(api.emailCapture).toBeInstanceOf(EmailCapture);
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
