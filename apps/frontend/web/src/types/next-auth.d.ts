import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface User {
        accessToken?: string;
    }

    interface Session {
        user: {
            id: string;
            accessToken?: string;
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        userId?: string;
        accessToken?: string;
    }
}
