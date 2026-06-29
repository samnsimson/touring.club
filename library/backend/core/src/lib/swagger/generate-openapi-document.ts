import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { validateEnv } from '@tc/config';
import { RootModule } from '../bootstrap/root.module';
import { Swagger } from './swagger.config';
import { SwaggerConfigOptions } from './swagger.contract';

export interface GenerateOpenApiDocumentOptions {
    rootModule: Type<unknown>;
    swagger?: SwaggerConfigOptions;
    outputPath: string;
}

/** `NestFactory.create(..., { logger: false })` silences Nest's static `Logger`, which would
 *  otherwise swallow any status log emitted here — use `console` directly so generation status is visible. */
export const generateOpenApiDocument = async ({ rootModule, swagger, outputPath }: GenerateOpenApiDocumentOptions) => {
    const title = swagger?.title ?? 'API';
    console.log(`📝 [openapi] Generating OpenAPI document for "${title}"...`);

    try {
        const env = validateEnv(process.env);
        const app = await NestFactory.create<NestExpressApplication>(RootModule.init(rootModule), { logger: false });
        await app.init();

        const document = Swagger.build(app, {
            title,
            env: swagger?.env ?? env.NODE_ENV,
            description: swagger?.description ?? 'API description',
            version: swagger?.version ?? '1.0',
        });

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(document, null, 2));
        await app.close();

        console.log(`✅ [openapi] Wrote ${outputPath}`);
    } catch (error) {
        console.error('❌ [openapi] Generation failed:', error);
        process.exit(1);
    }
};
