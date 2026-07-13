import { z } from 'zod';

export const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'staging', 'test']).default('development'),
    HOST: z.string().min(1).default('0.0.0.0'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),

    // PORTS
    GATEWAY_SERVICE_PORT: z.coerce.number().int().min(1).max(65535).default(8000),
    AUTH_SERVICE_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    USERS_SERVICE_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    TRIPS_SERVICE_PORT: z.coerce.number().int().min(1).max(65535).default(3002),
    MESSAGING_SERVICE_PORT: z.coerce.number().int().min(1).max(65535).default(3003),
    NOTIFICATIONS_SERVICE_PORT: z.coerce.number().int().min(1).max(65535).default(3004),

    // EDNPOINTS
    GATEWAY_SERVICE_URL: z.url().default('http://localhost:3000'),
    AUTH_SERVICE_URL: z.url().default('http://localhost:3000/api/v1'),
    USERS_SERVICE_URL: z.url().default('http://localhost:3001/api/v1'),
    TRIPS_SERVICE_URL: z.url().default('http://localhost:3002/api/v1'),
    MESSAGING_SERVICE_URL: z.url().default('http://localhost:3003/api/v1'),
    NOTIFICATIONS_SERVICE_URL: z.url().default('http://localhost:3004/api/v1'),

    EMAIL_PROVIDER: z.enum(['console', 'resend']).default('console'),
    EMAIL_FROM: z.string().min(1).default('Touring Club <noreply@touring.club>'),
    RESEND_API_KEY: z.string().min(1).optional(),
    AWS_REGION: z.string().min(1).default('us-east-1'),
    AWS_S3_BUCKET: z.string().min(1).default('touring-club-media'),
    AWS_S3_ENDPOINT: z.url().optional(),
    AWS_S3_PUBLIC_URL: z.url().optional(),
    AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
    AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;
export const envKeys = Object.keys(EnvSchema.shape) as (keyof Env)[];
