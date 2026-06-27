import { Logger } from '@nestjs/common';
import { validateEnv } from '@tc/config';
import { BootstrapApplicationOptions } from './contract';
import { createTestApplication } from './create-test-application';

export { createTestApplication } from './create-test-application';
export type { ApplicationBootstrapOptions, BootstrapApplicationOptions } from './contract';

export const bootstrapApplication = async ({ rootModule, port, globalPrefix = 'api', configure, swagger }: BootstrapApplicationOptions) => {
    const env = validateEnv(process.env);
    const logger = new Logger(bootstrapApplication.name);
    const app = await createTestApplication({
        rootModule,
        globalPrefix,
        configure,
        swagger,
        includeSwagger: true,
    });

    await app.listen(port, () => {
        const ENV = env.NODE_ENV.toUpperCase();
        const SERVER_URL = `http://${env.HOST}:${port}/${globalPrefix}`;
        logger.log(`🚀 ${ENV} service is running on: ${SERVER_URL}`);
    });
};
