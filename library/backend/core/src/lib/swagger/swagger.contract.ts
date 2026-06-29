import { Env } from '@tc/config';

export const SWAGGER_BEARER_AUTH = 'bearer' as const;

export interface SwaggerConfigOptions {
    env?: Env['NODE_ENV'];
    title?: string;
    description?: string;
    version?: string;
    path?: string;
}
