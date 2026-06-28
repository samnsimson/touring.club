import { HttpService } from '@nestjs/axios';
import { HttpClient } from '../../src/lib/http/http.client';
import { of } from 'rxjs';

describe('HttpClient', () => {
    it('converts get observables to promises', async () => {
        const httpService = {
            get: jest.fn().mockReturnValue(of({ data: { ok: true }, status: 200 })),
        } as unknown as HttpService;
        const client = new HttpClient(httpService);
        const response = await client.get<{ ok: boolean }>('https://example.com');
        expect(response.data).toEqual({ ok: true });
        expect(httpService.get).toHaveBeenCalledWith('https://example.com', undefined);
    });

    it('converts post observables to promises', async () => {
        const httpService = {
            post: jest.fn().mockReturnValue(of({ data: { id: '1' }, status: 201 })),
        } as unknown as HttpService;
        const client = new HttpClient(httpService);
        const response = await client.post<{ id: string }>('https://example.com', { name: 'test' }, { headers: { 'x-test': '1' } });
        expect(response.data).toEqual({ id: '1' });
        expect(httpService.post).toHaveBeenCalledWith('https://example.com', { name: 'test' }, { headers: { 'x-test': '1' } });
    });
});
