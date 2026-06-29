import { validateEnv } from '../../src/lib/validate-env';

describe('validateEnv', () => {
    const validEnv = {
        NODE_ENV: 'development',
        HOST: 'localhost',
        PORT: '3000',
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/touring_club',
        BETTER_AUTH_SECRET: 'development-secret-change-me-in-production-min-32-chars',
    };

    it('parses and coerces valid environment variables', () => {
        const env = validateEnv(validEnv);

        expect(env.PORT).toBe(3000);
        expect(env.NODE_ENV).toBe('development');
        expect(env.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    });

    it('applies defaults for optional values', () => {
        const env = validateEnv({
            DATABASE_URL: validEnv.DATABASE_URL,
            BETTER_AUTH_SECRET: validEnv.BETTER_AUTH_SECRET,
        });

        expect(env.NODE_ENV).toBe('development');
        expect(env.HOST).toBe('0.0.0.0');
        expect(env.PORT).toBe(3000);
    });

    it('throws with a readable error when validation fails', () => {
        expect(() => validateEnv({})).toThrow('Environment validation failed');
        expect(() => validateEnv({})).toThrow('DATABASE_URL');
    });
});
