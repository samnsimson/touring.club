import { Env, EnvSchema } from './env.schema';
import { z } from 'zod';

const formatIssue = (issue: z.core.$ZodIssue) => `  - ${issue.path.join('.')}: ${issue.message}`;

export function validateEnv(config: Record<string, unknown>): Env {
    const result = EnvSchema.safeParse(config);
    if (!result.success) {
        const message = result.error.issues.map(formatIssue).join('\n');
        throw new Error(`Environment validation failed:\n${message}`);
    }
    return result.data;
}
