import { Type } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerConfigOptions } from '../swagger';

export interface ApplicationBootstrapOptions {
    rootModule: Type<unknown>;
    swagger?: SwaggerConfigOptions;
    globalPrefix?: string;
    configure?: (app: NestExpressApplication) => void | Promise<void>;
    includeSwagger?: boolean;
}

export interface BootstrapApplicationOptions extends ApplicationBootstrapOptions {
    port: number;
}
