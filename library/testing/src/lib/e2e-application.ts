import { ValidationPipe, VersioningType } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { composeHealthRoutes, RootModule } from '@tc/core';
import { WsAuthGuard } from '@tc/auth';
import { E2EApi } from './e2e-request';
import { E2EApplicationOptions } from './testing.contracts';

export class E2EApplication {
    private app?: NestExpressApplication;
    private api?: E2EApi;

    constructor(private readonly options: E2EApplicationOptions) {}

    async bootstrap(): Promise<void> {
        if (this.app) return;

        const globalPrefix = this.options.globalPrefix ?? 'api';
        const moduleBuilder = Test.createTestingModule({
            imports: [RootModule.init(this.options.rootModule, { globalAuth: !this.options.authGuard })],
            providers: this.options.authGuard ? [{ provide: APP_GUARD, useClass: this.options.authGuard }] : [],
        });
        // WsAuthGuard is referenced via @UseGuards(), so Nest auto-discovers it into the gateway's module
        // `injectables` collection (not `providers`) - overrideGuard checks `hasInjectable`, overrideProvider
        // checks `hasProvider`, so overrideProvider would silently no-op here.
        if (this.options.wsAuthGuard) moduleBuilder.overrideGuard(WsAuthGuard).useClass(this.options.wsAuthGuard);

        const moduleRef = await moduleBuilder.compile();

        this.app = moduleRef.createNestApplication<NestExpressApplication>();
        this.app.setGlobalPrefix(globalPrefix);
        this.app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1', prefix: 'v' });
        this.app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
        this.app.use(cookieParser());
        if (this.options.listenUrl) this.app.useWebSocketAdapter(new IoAdapter(this.app.getHttpServer()));
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

    getApp(): NestExpressApplication {
        if (!this.app) throw new Error('E2E application not initialized. Call bootstrap() before getApp().');
        return this.app;
    }

    getBaseUrl(): string {
        if (!this.app) throw new Error('E2E application not initialized. Call bootstrap() before getBaseUrl().');
        const address = this.app.getHttpServer().address();
        if (!address || typeof address === 'string') throw new Error('E2E application is not listening. Set listenUrl in E2EApplicationOptions.');
        return `http://127.0.0.1:${address.port}`;
    }

    async close(): Promise<void> {
        await this.app?.close();
        this.app = undefined;
        this.api = undefined;
    }
}
