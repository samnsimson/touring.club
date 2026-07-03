import { mkdirSync, writeFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { validateEnv } from '@tc/config';
import { generateOpenApiDocument } from '../../src/lib/swagger/generate-openapi-document';
import { RootModule } from '../../src/lib/bootstrap/root.module';
import { Swagger } from '../../src/lib/swagger/swagger.config';

jest.mock('node:fs');
jest.mock('@nestjs/core');
jest.mock('@tc/config');
jest.mock('../../src/lib/bootstrap/root.module', () => ({ RootModule: { init: jest.fn() } }));
jest.mock('../../src/lib/swagger/swagger.config', () => ({ Swagger: { build: jest.fn() } }));

describe('generateOpenApiDocument', () => {
    const rootModule = class AppModule {};
    const document = { openapi: '3.0.0', info: { title: 'Auth Service' } };

    let app: { init: jest.Mock; close: jest.Mock };
    let processExitSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        app = { init: jest.fn().mockResolvedValue(undefined), close: jest.fn().mockResolvedValue(undefined) };
        (NestFactory.create as jest.Mock).mockResolvedValue(app);
        (RootModule.init as jest.Mock).mockReturnValue('dynamic-module');
        (validateEnv as jest.Mock).mockReturnValue({ NODE_ENV: 'test' });
        (Swagger.build as jest.Mock).mockReturnValue(document);
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
        processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('builds the swagger document and writes it to the output path', async () => {
        await generateOpenApiDocument({
            rootModule,
            swagger: { title: 'Auth Service', description: 'Auth Service API' },
            outputPath: 'apps/backend/auth-service/openapi/auth-service.openapi.json',
        });

        expect(RootModule.init).toHaveBeenCalledWith(rootModule);
        expect(NestFactory.create).toHaveBeenCalledWith('dynamic-module', { logger: false });
        expect(app.init).toHaveBeenCalledTimes(1);
        expect(Swagger.build).toHaveBeenCalledWith(
            app,
            expect.objectContaining({ title: 'Auth Service', description: 'Auth Service API', env: 'test', version: '1.0' }),
        );
        expect(mkdirSync).toHaveBeenCalledWith('apps/backend/auth-service/openapi', { recursive: true });
        expect(writeFileSync).toHaveBeenCalledWith('apps/backend/auth-service/openapi/auth-service.openapi.json', JSON.stringify(document, null, 2));
        expect(app.close).toHaveBeenCalledTimes(1);
        expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('defaults title, description and version when swagger options are omitted', async () => {
        await generateOpenApiDocument({ rootModule, outputPath: 'apps/backend/auth-service/openapi/auth-service.openapi.json' });

        expect(Swagger.build).toHaveBeenCalledWith(app, expect.objectContaining({ title: 'API', description: 'API description', version: '1.0' }));
    });

    it('logs the error and exits with a non-zero code when generation fails', async () => {
        const error = new Error('connection refused');
        (NestFactory.create as jest.Mock).mockRejectedValue(error);

        await generateOpenApiDocument({ rootModule, outputPath: 'apps/backend/auth-service/openapi/auth-service.openapi.json' });

        expect(console.error).toHaveBeenCalledWith('❌ [openapi] Generation failed:', error);
        expect(processExitSpy).toHaveBeenCalledWith(1);
        expect(writeFileSync).not.toHaveBeenCalled();
    });
});
