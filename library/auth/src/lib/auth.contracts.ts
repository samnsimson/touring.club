import { ModuleMetadata } from '@nestjs/common';

export interface AuthConfig {
    isGlobal?: boolean;
}

export interface AuthModuleOptions {
    imports?: ModuleMetadata['imports'];
    providers?: ModuleMetadata['providers'];
    exports?: ModuleMetadata['exports'];
}
