import { Env } from '@tc/config';

export interface SwaggerConfigOptions {
    env?: Env['NODE_ENV'];
    title?: string;
    description?: string;
    version?: string;
    path?: string;
}
