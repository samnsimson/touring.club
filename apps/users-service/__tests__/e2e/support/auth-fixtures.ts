import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import type { E2EApi } from '@tc/testing';

type AuthUserFixture = {
    name: string;
    email: string;
    username: string;
    emailVerified?: boolean;
};

export type FixtureUser = {
    userId: string;
    email: string;
    name: string;
    username: string;
    accessToken: string;
};

const fixturesDir = path.join(__dirname, '../fixtures/auth');

function loadAuthUserFixture(name: string): AuthUserFixture {
    const fixturePath = path.join(fixturesDir, `${name}.json`);
    if (!fs.existsSync(fixturePath)) throw new Error(`Auth fixture "${name}" not found at ${fixturePath}`);
    return JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as AuthUserFixture;
}

const uniqueSuffix = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function uniqueEmail(templateEmail: string, suffix: string): string {
    const [local, domain] = templateEmail.split('@');
    if (!domain) throw new Error(`Invalid fixture email: ${templateEmail}`);
    return `${local}+${suffix}@${domain}`;
}

export function requireDatabase(testName: string): boolean {
    if (process.env.DATABASE_URL) return true;
    console.warn(`Skipping ${testName}: DATABASE_URL is not set`);
    return false;
}

export async function seedFixtureUser(fixtureName = 'default-user'): Promise<FixtureUser> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL is required to seed auth fixture users');

    const template = loadAuthUserFixture(fixtureName);
    const suffix = uniqueSuffix();
    const userId = randomUUID();
    const email = uniqueEmail(template.email, suffix);
    const username = `${template.username}${suffix.replace(/-/g, '')}`;
    const now = new Date();

    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
        await client.query(
            `INSERT INTO auth.users (id, name, email, email_verified, created_at, updated_at, username, display_username)
             VALUES ($1, $2, $3, $4, $5, $5, $6, $6)`,
            [userId, template.name, email, template.emailVerified ?? true, now, username],
        );
    } finally {
        await client.end();
    }

    return { userId, email, name: template.name, username, accessToken: userId };
}

export function authedApi(api: E2EApi, user: Pick<FixtureUser, 'accessToken'>): E2EApi {
    return api.setHeader('Authorization', `Bearer ${user.accessToken}`);
}
