import { Type } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerConfigOptions } from '../swagger';

export interface ApplicationBootstrapOptions {
    rootModule: Type<unknown>;
    swagger?: SwaggerConfigOptions;
    globalPrefix?: string;
    globalAuthGuard?: Type<unknown>;
    configure?: (app: NestExpressApplication) => void | Promise<void>;
    includeSwagger?: boolean;
    port: number;
}
