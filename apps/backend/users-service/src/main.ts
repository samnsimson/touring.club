import { AppModule } from './app/app.module';
import { validateEnv } from '@tc/config';
import { bootstrapApplication } from '@tc/core';

async function bootstrap() {
    const env = validateEnv(process.env);

    await bootstrapApplication({
        globalPrefix: 'api',
        rootModule: AppModule,
        port: env.USERS_SERVICE_PORT ?? 3001,
        swagger: { title: 'Users Service', description: 'User profiles API' },
    });
}

bootstrap();
