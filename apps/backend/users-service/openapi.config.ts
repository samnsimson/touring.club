import { generateOpenApiDocument } from '@tc/core';
import { AppModule } from './src/app/app.module';

generateOpenApiDocument({
    rootModule: AppModule,
    swagger: { title: 'Users Service', description: 'User profiles API' },
    outputPath: 'apps/backend/users-service/openapi/users-service.openapi.json',
});
