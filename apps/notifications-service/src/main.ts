import { AppModule } from './app/app.module';
import { validateEnv } from '@tc/config';
import { bootstrapApplication } from '@tc/core';

async function bootstrap() {
    const env = validateEnv(process.env);

    await bootstrapApplication({
        globalPrefix: 'api',
        rootModule: AppModule,
        port: env.NOTIFICATIONS_SERVICE_PORT ?? 3004,
        swagger: { title: 'Notifications Service', description: 'In-app notifications API' },
    });
}

bootstrap();
