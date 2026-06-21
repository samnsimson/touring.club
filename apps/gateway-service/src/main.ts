import { bootstrapApplication } from '@tc/core';
import { AppModule } from './app/app.module';
import { validateEnv } from '@tc/config';

async function bootstrap() {
    const env = validateEnv(process.env);
    await bootstrapApplication({
        rootModule: AppModule,
        port: env.PORT ?? 3000,
        globalPrefix: 'api',
    });
}

bootstrap();
