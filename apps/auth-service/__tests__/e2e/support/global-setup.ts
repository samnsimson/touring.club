import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { waitForPortOpen } from '@nx/node/utils';

const AUTH_E2E_EMAIL_CAPTURE_DIR = process.env.EMAIL_CAPTURE_DIR ?? 'apps/auth-service/.tmp/e2e-email-capture';

function clearCapturedEmails(captureDir: string): void {
    const resolvedDir = path.resolve(process.cwd(), captureDir);
    fs.mkdirSync(resolvedDir, { recursive: true });
    for (const entry of fs.readdirSync(resolvedDir)) {
        if (entry.endsWith('.json')) fs.unlinkSync(path.join(resolvedDir, entry));
    }
}

declare global {
    var __TEARDOWN_MESSAGE__: string;
}

module.exports = async function () {
    console.log('\nSetting up auth-service e2e...\n');

    if (process.env.DATABASE_URL) {
        const result = spawnSync('bun', ['library/database/src/run-migrations.ts'], {
            cwd: process.cwd(),
            stdio: 'inherit',
            env: process.env,
        });
        if (result.status !== 0) throw new Error('Database migrations failed during e2e global setup');
    }

    clearCapturedEmails(AUTH_E2E_EMAIL_CAPTURE_DIR);

    const host = process.env.HOST ?? 'localhost';
    const port = Number(process.env.AUTH_SERVICE_PORT ?? process.env.PORT ?? 3000);
    await waitForPortOpen(port, { host });

    globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down auth-service e2e...\n';
};
