import { Client } from 'pg';

export async function getVerificationValue(identifier: string): Promise<string | undefined> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return undefined;

    const client = new Client({ connectionString: databaseUrl });
    await client.connect();

    try {
        const result = await client.query<{ value: string }>(`SELECT value FROM auth.verifications WHERE identifier = $1 ORDER BY created_at DESC LIMIT 1`, [
            identifier,
        ]);
        return result.rows[0]?.value;
    } finally {
        await client.end();
    }
}

export function extractStoredOtp(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const [otp] = value.split(':');
    return otp || undefined;
}

export async function getEmailOtp(email: string): Promise<string | undefined> {
    const identifier = `email-verification-otp-${email.toLowerCase()}`;
    return extractStoredOtp(await getVerificationValue(identifier));
}

export async function getPasswordResetToken(email: string): Promise<string | undefined> {
    const identifier = `reset-password:${email.toLowerCase()}`;
    const value = await getVerificationValue(identifier);
    if (value) return value.split(':')[0];
    return undefined;
}
