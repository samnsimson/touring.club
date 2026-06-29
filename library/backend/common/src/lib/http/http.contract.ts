export type HttpRequestConfig = {
    headers?: Record<string, string | number | boolean | string[] | undefined>;
    params?: Record<string, unknown>;
    timeout?: number;
    responseType?: 'json' | 'text' | 'arraybuffer' | 'blob' | 'document' | 'stream';
};

export type HttpModuleOptions = HttpRequestConfig & {
    global?: boolean;
    baseURL?: string;
    maxRedirects?: number;
    httpAgent?: unknown;
    httpsAgent?: unknown;
};

export type HttpResponse<T = unknown> = {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, unknown>;
};

export type HttpError = {
    message: string;
    response?: HttpResponse<unknown>;
};

export type AxiosLikeResponse<T> = {
    data: T;
    status: number;
    statusText: string;
    headers: unknown;
};
