import { generateOpenApiDocument } from '@tc/core';
import { AppModule } from './src/app/app.module';

generateOpenApiDocument({
    rootModule: AppModule,
    swagger: { title: 'Auth Service', description: 'Auth Service API' },
    outputPath: 'apps/backend/auth-service/openapi/auth-service.openapi.json',
});
