import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_BEARER_AUTH, SwaggerConfigOptions } from './swagger.contract';

export class Swagger {
    private static readonly logger = new Logger(Swagger.name);

    static build(app: INestApplication, options: SwaggerConfigOptions) {
        let config = new DocumentBuilder();
        config = config.setTitle(options.title ?? 'API');
        config = config.setDescription(options.description ?? 'API description');
        config = config.setVersion(options.version ?? '1.0');
        config = config.addBearerAuth(this.bearerAuthScheme(), SWAGGER_BEARER_AUTH);
        return SwaggerModule.createDocument(app, config.build());
    }

    static init(app: INestApplication, options: SwaggerConfigOptions) {
        const document = this.build(app, options);
        SwaggerModule.setup(options.path ?? 'docs', app, document);
        this.logger.log(`Swagger initialized on ${options.path ?? 'docs'}`);
        return document;
    }

    private static bearerAuthScheme() {
        return {
            type: 'http' as const,
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter bearer token',
            in: 'header' as const,
        };
    }
}

export type SwaggerDocument = ReturnType<typeof Swagger.init>;
