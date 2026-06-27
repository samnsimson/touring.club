import type { SnapshotValue } from './testing.contracts';

const DEFAULT_REDACT_KEYS = ['accessToken', 'sessionToken', 'token', 'id', 'createdAt', 'updatedAt', 'otp'];

export function redactSnapshotValue(value: unknown, redactKeys: string[] = DEFAULT_REDACT_KEYS): SnapshotValue {
    if (Array.isArray(value)) {
        return value.map((entry) => redactSnapshotValue(entry, redactKeys));
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
                if (redactKeys.includes(key)) {
                    return [key, '[redacted]'];
                }
                return [key, redactSnapshotValue(entry, redactKeys)];
            }),
        );
    }

    return value as SnapshotValue;
}
