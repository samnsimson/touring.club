import { generateOpenApiDocument } from '@tc/core';
import { AppModule } from './src/app/app.module';

generateOpenApiDocument({
    rootModule: AppModule,
    swagger: { title: 'Notifications Service', description: 'In-app notifications API' },
    outputPath: 'apps/backend/notifications-service/openapi/notifications-service.openapi.json',
});
