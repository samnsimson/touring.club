import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createE2ERequest, EmailCapture, RequestFixtureLoader, SnapshotRedactor } from './testing';

describe('@tc/testing', () => {
    it('loads request fixtures from disk', () => {
        const fixturesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-request-fixtures-'));
        fs.writeFileSync(path.join(fixturesDir, 'sign-up.request.json'), JSON.stringify({ email: 'a@b.test' }), 'utf8');

        const fixtures = new RequestFixtureLoader({ fixturesDir });
        expect(fixtures.load<{ email: string }>('sign-up')).toEqual({ email: 'a@b.test' });
    });

    it('redacts dynamic fields for jest snapshots', () => {
        const redactor = new SnapshotRedactor();

        expect(
            redactor.redact({
                id: 'user-1',
                accessToken: 'secret',
                profile: { email: 'a@b.test' },
            }),
        ).toEqual({
            id: '[redacted]',
            accessToken: '[redacted]',
            profile: { email: '[redacted]' },
        });
    });

    it('extracts otp and reset tokens from captured email text', () => {
        const emailCapture = new EmailCapture();

        expect(emailCapture.extractOtp('Your verification code is 123456.')).toBe('123456');
        expect(emailCapture.extractResetToken('Or enter this token: reset-token-abc')).toBe('reset-token-abc');
    });

    it('waits for captured emails written by the capture provider', async () => {
        const captureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-email-capture-'));
        const emailCapture = new EmailCapture({ captureDir, pollIntervalMs: 25, pollTimeoutMs: 1_000 });
        emailCapture.clear();

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

        const email = await emailCapture.waitFor({ to: 'user@example.com', subjectIncludes: 'verification code' });
        expect(email.text).toContain('654321');
    });

    it('sends requests through supertest', async () => {
        const server = http.createServer((_req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
        });

        await new Promise<void>((resolve) => server.listen(0, resolve));
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected server to listen on a port');

        const api = createE2ERequest({ server: `http://127.0.0.1:${address.port}` });
        const response = await api.get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ ok: true });

        await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    });
});
