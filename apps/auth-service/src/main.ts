import { createBetterAuthMiddleware } from '@tc/auth';
import { prepareAuthLibrary } from '@tc/auth/prepare';
import { validateEnv } from '@tc/config';
import { bootstrapApplication } from '@tc/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
    const env = validateEnv(process.env);
    await prepareAuthLibrary();

    await bootstrapApplication({
        globalPrefix: 'api',
        rootModule: AppModule,
        port: env.AUTH_SERVICE_PORT ?? 3000,
        swagger: { title: 'Auth Service', description: 'Auth Service API' },
        configure: async (app) => {
            app.use(createBetterAuthMiddleware());
        },
    });
}

bootstrap();
