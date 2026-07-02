import type { Request } from 'express';
import { AUTH_ACCESS_TOKEN_COOKIE, AUTH_BETTER_AUTH_SESSION_COOKIES, AUTH_REFRESH_TOKEN_COOKIE } from '../constants/auth.constants';

const bearerScheme = 'bearer ';

export class AuthHeaders {
    static fromRequest(request: Pick<Request, 'headers' | 'cookies'>): Headers {
        const headers = new Headers();
        const authorization = request.headers.authorization;
        if (authorization) headers.set('authorization', authorization);
        const cookieHeader = this.buildSessionCookieHeader(request);
        if (cookieHeader) headers.set('cookie', cookieHeader);
        return headers;
    }

    static getSessionToken(request: Pick<Request, 'headers' | 'cookies'>): string | undefined {
        const authorization = request.headers.authorization;
        if (authorization?.toLowerCase().startsWith(bearerScheme)) {
            const token = authorization.slice(bearerScheme.length).trim();
            if (token) return token;
        }

        const refreshToken = request.cookies?.[AUTH_REFRESH_TOKEN_COOKIE];
        if (typeof refreshToken === 'string' && refreshToken) return refreshToken;

        for (const cookieName of AUTH_BETTER_AUTH_SESSION_COOKIES) {
            const cookieToken = request.cookies?.[cookieName];
            if (typeof cookieToken === 'string' && cookieToken) return cookieToken;
        }

        const cookieHeader = request.headers.cookie;
        if (!cookieHeader) return undefined;

        for (const cookieName of [AUTH_REFRESH_TOKEN_COOKIE, ...AUTH_BETTER_AUTH_SESSION_COOKIES]) {
            const cookieToken = this.readCookie(cookieHeader, cookieName);
            if (cookieToken) return cookieToken;
        }

        return undefined;
    }

    static getAccessToken(request: Pick<Request, 'headers' | 'cookies'>): string | undefined {
        const authorization = request.headers.authorization;
        if (authorization?.toLowerCase().startsWith(bearerScheme)) {
            const token = authorization.slice(bearerScheme.length).trim();
            if (token) return token;
        }

        const accessToken = request.cookies?.[AUTH_ACCESS_TOKEN_COOKIE];
        if (typeof accessToken === 'string' && accessToken) return accessToken;

        const cookieHeader = request.headers.cookie;
        if (!cookieHeader) return undefined;

        return this.readCookie(cookieHeader, AUTH_ACCESS_TOKEN_COOKIE);
    }

    private static buildSessionCookieHeader(request: Pick<Request, 'headers' | 'cookies'>): string | undefined {
        const sessionToken = this.getSessionToken(request);
        if (!sessionToken) return request.headers.cookie;

        const betterAuthCookie = `${AUTH_BETTER_AUTH_SESSION_COOKIES[0]}=${encodeURIComponent(sessionToken)}`;
        const existingCookie = request.headers.cookie;
        if (!existingCookie) return betterAuthCookie;

        const withoutSessionCookies = existingCookie
            .split(';')
            .map((part) => part.trim())
            .filter((part) => !AUTH_BETTER_AUTH_SESSION_COOKIES.some((name) => part.startsWith(`${name}=`)))
            .filter((part) => !part.startsWith(`${AUTH_REFRESH_TOKEN_COOKIE}=`));

        return [...withoutSessionCookies, betterAuthCookie].join('; ');
    }

    private static readCookie(cookieHeader: string, name: string): string | undefined {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]*)`));
        if (!match?.[1]) return undefined;
        return decodeURIComponent(match[1]);
    }
}
