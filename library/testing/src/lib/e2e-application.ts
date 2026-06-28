import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { composeHealthRoutes, RootModule } from '@tc/core';
import { E2EApi } from './e2e-request';
import { E2EApplicationOptions } from './testing.contracts';

export class E2EApplication {
    private app?: NestExpressApplication;
    private api?: E2EApi;

    constructor(private readonly options: E2EApplicationOptions) {}

    async bootstrap(): Promise<void> {
        if (this.app) return;

        const globalPrefix = this.options.globalPrefix ?? 'api';
        const moduleRef = await Test.createTestingModule({
            imports: [RootModule.init(this.options.rootModule)],
        }).compile();

        this.app = moduleRef.createNestApplication<NestExpressApplication>();
        this.app.setGlobalPrefix(globalPrefix);
        this.app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1', prefix: 'v' });
        this.app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
        this.app.use(cookieParser());
        composeHealthRoutes(this.app, globalPrefix);

        if (this.options.configure) await this.options.configure(this.app);

        await this.app.init();

        if (this.options.listenUrl) {
            const url = new URL(this.options.listenUrl);
            const port = url.port ? Number(url.port) : url.protocol === 'https:' ? 443 : 80;
            await this.app.listen(port, url.hostname);
        }

        this.api = new E2EApi({
            server: this.app.getHttpServer(),
            fixturesDir: this.options.fixturesDir,
        });
    }

    getApi(): E2EApi {
        if (!this.api) throw new Error('E2E application not initialized. Call bootstrap() before getApi().');
        return this.api;
    }

    async close(): Promise<void> {
        await this.app?.close();
        this.app = undefined;
        this.api = undefined;
    }
}
