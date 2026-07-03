import { Env } from '@tc/config';

export { SWAGGER_BEARER_AUTH } from '@tc/utils';

export interface SwaggerConfigOptions {
    env?: Env['NODE_ENV'];
    title?: string;
    description?: string;
    version?: string;
    path?: string;
}
