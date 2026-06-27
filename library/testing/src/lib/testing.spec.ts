import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { E2ETestingEngine } from './e2e-testing-engine';
import { clearCapturedEmails, extractOtpFromEmail, extractResetTokenFromEmail, waitForCapturedEmail } from './email-capture';
import { interpolateFixture, loadFixture } from './fixture-utils';
import { createE2ETestingEngine, redactSnapshotValue } from './testing';

describe('@tc/testing', () => {
    it('interpolates fixture templates', () => {
        const result = interpolateFixture({ email: '{{email}}', nested: { username: '{{username}}' } }, { email: 'a@b.test', username: 'alice' });

        expect(result).toEqual({ email: 'a@b.test', nested: { username: 'alice' } });
    });

    it('loads fixtures from disk', () => {
        const fixturesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-fixtures-'));
        fs.writeFileSync(path.join(fixturesDir, 'sample.fixture.json'), JSON.stringify({ ok: true }), 'utf8');

        expect(loadFixture<{ ok: boolean }>(fixturesDir, 'sample')).toEqual({ ok: true });
    });

    it('redacts dynamic snapshot fields', () => {
        expect(
            redactSnapshotValue({
                id: 'abc',
                accessToken: 'secret',
                user: { email: 'a@b.test', sessionToken: 'token' },
            }),
        ).toEqual({
            id: '[redacted]',
            accessToken: '[redacted]',
            user: { email: 'a@b.test', sessionToken: '[redacted]' },
        });
    });

    it('extracts otp and reset tokens from captured email text', () => {
        expect(extractOtpFromEmail('Your verification code is 123456. It expires in 10 minutes.')).toBe('123456');
        expect(extractResetTokenFromEmail('Use this link to reset your password: http://localhost\n\nOr enter this token: abc-reset-token')).toBe(
            'abc-reset-token',
        );
    });

    it('waits for captured emails', async () => {
        const captureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-email-capture-'));
        clearCapturedEmails(captureDir);

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

        const email = await waitForCapturedEmail(captureDir, { to: 'user@example.com', subjectIncludes: 'verification code' }, 25, 1_000);
        expect(email.text).toContain('654321');
    });

    it('creates an e2e engine with fixture helpers', async () => {
        const fixturesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-engine-fixtures-'));
        fs.writeFileSync(path.join(fixturesDir, 'user.fixture.json'), JSON.stringify({ email: '{{email}}' }), 'utf8');

        const engine = createE2ETestingEngine({ fixturesDir });
        await engine.useFixture('user', { email: 'engine@example.com' }, async ({ fixture }) => {
            expect(fixture).toEqual({ email: 'engine@example.com' });
        });
    });
});

describe('E2ETestingEngine', () => {
    it('uses the configured capture directory', () => {
        const engine = new E2ETestingEngine({ emailCaptureDir: '.tmp/custom-capture' });
        engine.clearCapturedEmails();
        expect(fs.existsSync(path.resolve(process.cwd(), '.tmp/custom-capture'))).toBe(true);
    });
});
