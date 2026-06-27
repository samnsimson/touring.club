import type { NestExpressApplication } from '@nestjs/platform-express';
import { createBetterAuthMiddleware } from '@tc/auth';
import { prepareAuthLibrary } from '@tc/auth/prepare';
import { createTestApplication } from '@tc/core';
import { E2EApi } from '@tc/testing';
import { AppModule } from '../../../src/app/app.module';
import { AUTH_E2E_EMAIL_CAPTURE_DIR } from './auth-client';

let nestApp: NestExpressApplication | undefined;
let api: E2EApi | undefined;

export async function bootstrapAuthE2EApp(): Promise<void> {
    if (nestApp) return;

    await prepareAuthLibrary();

    nestApp = await createTestApplication({
        rootModule: AppModule,
        globalPrefix: 'api',
        configure: async (app) => {
            app.use(createBetterAuthMiddleware());
        },
    });

    api = new E2EApi({
        server: nestApp.getHttpServer(),
        emailCaptureDir: AUTH_E2E_EMAIL_CAPTURE_DIR,
    });
}

export function getAuthE2EApi(): E2EApi {
    if (!api) throw new Error('Auth e2e app not initialized. Ensure e2e-setup runs before tests.');
    return api;
}

export async function closeAuthE2EApp(): Promise<void> {
    await nestApp?.close();
    nestApp = undefined;
    api = undefined;
}
