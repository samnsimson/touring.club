import { Inject, Injectable } from '@nestjs/common';
import type { Env } from './env.schema';
import { CONFIG_ENV } from './config.contract';

@Injectable()
export class ConfigService {
    constructor(@Inject(CONFIG_ENV) private readonly env: Env) {}

    get<K extends keyof Env>(key: K): Env[K] {
        return this.env[key];
    }

    getAll(): Readonly<Env> {
        return this.env;
    }

    getOrThrow<K extends keyof Env>(key: K): Env[K] {
        const value = this.get(key);
        if (value === undefined) throw new Error(`Config key ${key} is not set`);
        return value;
    }
}
