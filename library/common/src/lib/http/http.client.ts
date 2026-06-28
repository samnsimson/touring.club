import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import { AxiosLikeResponse, HttpError, HttpRequestConfig, HttpResponse } from './http.contract';

export function isHttpError(error: unknown): error is HttpError & { response: HttpResponse<unknown> } {
    return typeof error === 'object' && error !== null && 'response' in error && typeof (error as HttpError).response === 'object';
}

@Injectable()
export class HttpClient {
    constructor(private readonly http: HttpService) {}

    private async toResponse<T>(source: Observable<AxiosLikeResponse<T>>): Promise<HttpResponse<T>> {
        const res = await firstValueFrom(source);
        return { data: res.data, status: res.status, statusText: res.statusText, headers: res.headers as Record<string, unknown> };
    }

    get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
        return this.toResponse(this.http.get<T>(url, config as never));
    }

    post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
        return this.toResponse(this.http.post<T>(url, data, config as never));
    }

    put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
        return this.toResponse(this.http.put<T>(url, data, config as never));
    }

    patch<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
        return this.toResponse(this.http.patch<T>(url, data, config as never));
    }

    delete<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
        return this.toResponse(this.http.delete<T>(url, config as never));
    }

    head<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
        return this.toResponse(this.http.head<T>(url, config as never));
    }

    request<T>(config: HttpRequestConfig & { url: string; method?: string }): Promise<HttpResponse<T>> {
        return this.toResponse(this.http.request<T>(config as never));
    }
}
