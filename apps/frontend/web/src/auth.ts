import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { mockUsers } from '@tc/mocks';

export const DEMO_PASSWORD = 'travel123';

function emailForUsername(username: string): string {
    return `${username}@touring.club`;
}

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
            authorize(credentials) {
                const email = typeof credentials?.email === 'string' ? credentials.email.toLowerCase().trim() : undefined;
                const password = typeof credentials?.password === 'string' ? credentials.password : undefined;
                if (!email || password !== DEMO_PASSWORD) return null;

                const user = mockUsers.find((candidate) => emailForUsername(candidate.username) === email);
                if (!user) return null;

                return { id: user.id, name: user.name, email, image: user.avatarUrl };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) token.userId = user.id;
            return token;
        },
        session({ session, token }) {
            if (token.userId && session.user) session.user.id = token.userId as string;
            return session;
        },
    },
});

export { emailForUsername };
