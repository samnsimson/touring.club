import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { configureAuthServiceClient, signIn as signInWithAuthService } from '@tc/client-api/services/auth-service';

configureAuthServiceClient({ baseUrl: `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1` });

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: { signIn: '/login' },
    session: { strategy: 'jwt' },
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const email = typeof credentials?.email === 'string' ? credentials.email.toLowerCase().trim() : undefined;
                const password = typeof credentials?.password === 'string' ? credentials.password : undefined;
                if (!email || !password) return null;

                const { data } = await signInWithAuthService({ body: { email, password } });
                if (!data) return null;

                return { id: data.id, name: data.name, email: data.email, image: data.image ?? undefined, accessToken: data.accessToken };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.userId = user.id;
                token.accessToken = user.accessToken;
            }
            return token;
        },
        session({ session, token }) {
            if (token.userId && session.user) session.user.id = token.userId as string;
            if (token.accessToken && session.user) session.user.accessToken = token.accessToken as string;
            return session;
        },
    },
});
