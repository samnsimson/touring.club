import type { SnapshotRedactorOptions } from './testing.contracts';

export class SnapshotRedactor {
    static readonly defaultKeys = ['accessToken', 'sessionToken', 'token', 'id', 'createdAt', 'updatedAt', 'otp', 'email', 'username', 'displayUsername'];

    private readonly keys: Set<string>;

    constructor(options: SnapshotRedactorOptions = {}) {
        this.keys = new Set(options.keys ?? SnapshotRedactor.defaultKeys);
    }

    redact<T>(value: T): T {
        return this.redactValue(value) as T;
    }

    private redactValue(value: unknown): unknown {
        if (Array.isArray(value)) return value.map((entry) => this.redactValue(entry));
        if (value && typeof value === 'object') {
            const entries = Object.entries(value as Record<string, unknown>);
            return Object.fromEntries(entries.map(([key, entry]) => [key, this.keys.has(key) ? '[redacted]' : this.redactValue(entry)]));
        }
        return value;
    }
}
