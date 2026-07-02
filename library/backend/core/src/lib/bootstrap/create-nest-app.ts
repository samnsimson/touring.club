import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import cookieParser from 'cookie-parser';
import { validateEnv } from '@tc/config';
import { ApplicationBootstrapOptions } from './contract';
import { composeHealthRoutes } from './health.routes';
import { RootModule } from './root.module';
import { Swagger } from '../swagger';
import { NestFactory } from '@nestjs/core';

export const createNestApplication = async ({ rootModule, globalPrefix = 'api', configure, swagger, globalAuthGuard }: ApplicationBootstrapOptions) => {
    const env = validateEnv(process.env);

    const appRoot = RootModule.init(rootModule, { globalAuthGuard });
    const app = await NestFactory.create<NestExpressApplication>(appRoot);

    app.setGlobalPrefix(globalPrefix);
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1', prefix: 'v' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useWebSocketAdapter(new IoAdapter(app.getHttpServer()));
    app.use(cookieParser());

    composeHealthRoutes(app, globalPrefix);

    Swagger.init(app, {
        env: swagger?.env ?? env.NODE_ENV,
        title: swagger?.title ?? 'API',
        description: swagger?.description ?? 'API description',
        version: swagger?.version ?? '1.0',
        path: swagger?.path ?? '/docs',
    });

    if (configure) await configure(app);
    await app.init();
    return app;
};
