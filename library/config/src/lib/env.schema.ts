import { z } from 'zod';

export const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'staging', 'test']).default('development'),
    HOST: z.string().min(1).default('0.0.0.0'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    AUTH_SERVICE_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    AUTH_APP_URL: z.url().default('http://localhost:3000'),
    EMAIL_PROVIDER: z.enum(['console', 'resend', 'capture']).default('console'),
    EMAIL_CAPTURE_DIR: z.string().min(1).optional(),
    EMAIL_FROM: z.string().min(1).default('Touring Club <noreply@touring.club>'),
    RESEND_API_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;
export const envKeys = Object.keys(EnvSchema.shape) as (keyof Env)[];
