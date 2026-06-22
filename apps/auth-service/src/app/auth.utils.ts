import { UnauthorizedException } from '@nestjs/common';

export class AuthUtils {
    static getHeaders(token: string | null, defaultHeaders: Record<string, string> = {}): Headers {
        if (!token) throw new UnauthorizedException('No token provided');
        return new Headers({ ...defaultHeaders, Authorization: `Bearer ${token}` });
    }
}
