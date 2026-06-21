import { Type } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

export interface BootstrapApplicationOptions {
    rootModule: Type<unknown>;
    globalPrefix?: string;
    port: number;
    configure?: (app: NestExpressApplication) => void | Promise<void>;
}
