import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { composeRootModule } from './compose-root-module';
import { BootstrapApplicationOptions } from './contract';
import { validateEnv } from '@tc/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { composeHealthRoutes } from './health.routes';

export const bootstrapApplication = async ({ rootModule, port, globalPrefix = 'api', configure }: BootstrapApplicationOptions) => {
    const env = validateEnv(process.env);
    const logger = new Logger(bootstrapApplication.name);
    const app = await NestFactory.create<NestExpressApplication>(composeRootModule(rootModule));

    app.setGlobalPrefix(globalPrefix);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

    composeHealthRoutes(app, globalPrefix);
    if (configure) await configure(app);

    await app.listen(port, () => {
        logger.log(`🚀 ${env.NODE_ENV.toUpperCase()} service is running on: http://localhost:${port}/${globalPrefix}`);
    });
};
