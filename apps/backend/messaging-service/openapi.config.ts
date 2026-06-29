import { generateOpenApiDocument } from '@tc/core';
import { AppModule } from './src/app/app.module';

generateOpenApiDocument({
    rootModule: AppModule,
    swagger: { title: 'Messaging Service', description: 'Direct messaging API' },
    outputPath: 'apps/backend/messaging-service/openapi/messaging-service.openapi.json',
});
