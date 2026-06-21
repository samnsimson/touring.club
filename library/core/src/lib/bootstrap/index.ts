import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { composeRootModule } from './compose-root-module';
import { BootstrapApplicationOptions } from './contract';
import { validateEnv } from '@tc/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { composeHealthRoutes } from './health.routes';
import * as cookieParser from 'cookie-parser';

export const bootstrapApplication = async ({ rootModule, port, globalPrefix = 'api', configure }: BootstrapApplicationOptions) => {
    const env = validateEnv(process.env);
    const logger = new Logger(bootstrapApplication.name);
    const app = await NestFactory.create<NestExpressApplication>(composeRootModule(rootModule));

    app.setGlobalPrefix(globalPrefix);
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1', prefix: 'v' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.use(cookieParser());

    composeHealthRoutes(app, globalPrefix);
    if (configure) await configure(app);

    await app.listen(port, () => {
        const ENV = env.NODE_ENV.toUpperCase();
        const SERVER_URL = `http://${env.HOST}:${port}/${globalPrefix}`;
        logger.log(`🚀 ${ENV} service is running on: ${SERVER_URL}`);
    });
};
