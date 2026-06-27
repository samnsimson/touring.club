import { UnauthorizedException } from '@nestjs/common';

export class AuthUtils {
    static getHeaders(token: string | null, defaultHeaders: Record<string, string> | Headers = {}): Headers {
        if (!token) throw new UnauthorizedException('No token provided');
        const headers = new Headers(defaultHeaders);
        headers.set('Authorization', `Bearer ${token}`);
        return headers;
    }
}
