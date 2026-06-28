import { AppModule } from './app/app.module';
import { validateEnv } from '@tc/config';
import { bootstrapApplication } from '@tc/core';

async function bootstrap() {
    const env = validateEnv(process.env);

    await bootstrapApplication({
        globalPrefix: 'api',
        rootModule: AppModule,
        port: env.TRIPS_SERVICE_PORT ?? 3002,
        swagger: { title: 'Trips Service', description: 'Trip creation and management API' },
    });
}

bootstrap();
