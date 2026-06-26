import type { ModuleMetadata } from '@nestjs/common';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface DatabaseModuleOptions {
    imports?: ModuleMetadata['imports'];
    providers?: ModuleMetadata['providers'];
    exports?: ModuleMetadata['exports'];
    options?: Partial<TypeOrmModuleOptions>;
    connectionName: string;
}
