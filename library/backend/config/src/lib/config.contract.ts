export const CONFIG_ENV = Symbol('CONFIG_ENV');

export type ConfigLoader = () => Record<string, unknown>;
export interface ConfigModuleOptions {
    isGlobal?: boolean;
    envFilePath?: string | string[];
    load?: ConfigLoader[];
}
