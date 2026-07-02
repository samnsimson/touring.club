import { Logger } from '@nestjs/common';
import { validateEnv } from '@tc/config';
import { ApplicationBootstrapOptions } from './contract';
import { createNestApplication } from './create-nest-app';

export const bootstrapApplication = async ({ rootModule, port, globalPrefix = 'api', configure, swagger, globalAuthGuard }: ApplicationBootstrapOptions) => {
    const env = validateEnv(process.env);
    const logger = new Logger(bootstrapApplication.name);
    const app = await createNestApplication({ rootModule, port, globalPrefix, configure, swagger, globalAuthGuard });
    await app.listen(port, () => {
        const ENV = env.NODE_ENV.toUpperCase();
        const SERVER_URL = `http://${env.HOST}:${port}/${globalPrefix}`;
        logger.log(`🚀 ${ENV} service is running on: ${SERVER_URL}`);
    });
};
