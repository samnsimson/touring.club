import { NextResponse } from 'next/server';
import { auth } from './src/auth';

export const proxy = auth((req) => {
    if (!req.auth) {
        const loginUrl = new URL('/login', req.nextUrl.origin);
        loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
});

export const config = {
    matcher: ['/dashboard/:path*', '/messages/:path*', '/notifications/:path*', '/settings/:path*', '/profile'],
};
