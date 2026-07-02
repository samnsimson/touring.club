import { HybridAuthGuard } from '@tc/auth';
import { AppModule } from './app/app.module';
import { validateEnv } from '@tc/config';
import { bootstrapApplication } from '@tc/core';

async function bootstrap() {
    const env = validateEnv(process.env);

    await bootstrapApplication({
        globalPrefix: 'api',
        rootModule: AppModule,
        globalAuthGuard: HybridAuthGuard,
        port: env.AUTH_SERVICE_PORT ?? 3000,
        swagger: { title: 'Auth Service', description: 'Auth Service API' },
    });
}

bootstrap();
