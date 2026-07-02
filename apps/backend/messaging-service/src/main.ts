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
        port: env.MESSAGING_SERVICE_PORT ?? 3003,
        swagger: { title: 'Messaging Service', description: 'Direct messaging API' },
    });
}

bootstrap();
