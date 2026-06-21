import { betterAuth } from 'better-auth';
import { typeormAdapter } from './adapter/auth.adapter';
import { dataSource } from './auth.datasource';

export const auth = betterAuth({
    name: 'Touring Club',
    baseURL: 'http://localhost:3000',
    basePath: '/api/auth',
    secret: process.env.BETTER_AUTH_SECRET,
    database: typeormAdapter(dataSource, { usePlural: true, transaction: true }),
    emailAndPassword: { enabled: true, requireEmailVerification: true, autoSignIn: true },
});
