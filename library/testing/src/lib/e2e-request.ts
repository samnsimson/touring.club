import request from 'supertest';
import type supertest from 'supertest';
import type { E2EApiOptions } from './testing.contracts';
import { RequestFixtureLoader } from './request-fixture-loader';
import { SnapshotRedactor } from './snapshot-redactor';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type E2EResponse = supertest.Response;

export class E2EApi {
    private readonly headers: Record<string, string>;
    public readonly fixtureLoader: RequestFixtureLoader;
    public readonly snapshotRedactor: SnapshotRedactor;

    constructor(private readonly options: E2EApiOptions) {
        this.headers = { ...options.headers };
        this.snapshotRedactor = new SnapshotRedactor();
        this.fixtureLoader = new RequestFixtureLoader({ fixturesDir: options.fixturesDir });
    }

    setHeader(name: string, value: string): this {
        this.headers[name] = value;
        return this;
    }

    async get(url: string, headers?: Record<string, string>): Promise<E2EResponse> {
        const response = await this.send('get', url, undefined, headers);
        this.snapshotRedactor.redact(response.body);
        return response;
    }

    async post(url: string, body?: unknown, headers?: Record<string, string>): Promise<E2EResponse> {
        const response = await this.send('post', url, body, headers);
        this.snapshotRedactor.redact(response.body);
        return response;
    }

    async put(url: string, body?: unknown, headers?: Record<string, string>): Promise<E2EResponse> {
        const response = await this.send('put', url, body, headers);
        this.snapshotRedactor.redact(response.body);
        return response;
    }

    async patch(url: string, body?: unknown, headers?: Record<string, string>): Promise<E2EResponse> {
        const response = await this.send('patch', url, body, headers);
        this.snapshotRedactor.redact(response.body);
        return response;
    }

    async delete(url: string, body?: unknown, headers?: Record<string, string>): Promise<E2EResponse> {
        const response = await this.send('delete', url, body, headers);
        this.snapshotRedactor.redact(response.body);
        return response;
    }

    private send(method: HttpMethod, url: string, body?: unknown, headers?: Record<string, string>): Promise<E2EResponse> {
        let req = request(this.options.server)[method](url);
        for (const [name, value] of Object.entries(headers ?? this.headers)) req = req.set(name, value);
        if (body !== undefined) req = req.send(body as string | object);
        return req;
    }
}
