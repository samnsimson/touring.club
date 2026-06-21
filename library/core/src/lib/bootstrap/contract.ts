import { Type } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerConfigOptions } from '../swagger';

export interface BootstrapApplicationOptions {
    rootModule: Type<unknown>;
    swagger?: SwaggerConfigOptions;
    globalPrefix?: string;
    port: number;
    configure?: (app: NestExpressApplication) => void | Promise<void>;
}
