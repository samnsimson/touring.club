import { generateOpenApiDocument } from '@tc/core';
import { AppModule } from './src/app/app.module';

generateOpenApiDocument({
    rootModule: AppModule,
    swagger: { title: 'Trips Service', description: 'Trip creation and management API' },
    outputPath: 'apps/backend/trips-service/openapi/trips-service.openapi.json',
});
