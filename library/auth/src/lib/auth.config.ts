import { betterAuth } from 'better-auth';
import { typeormAdapter } from './adapter/auth.adapter';
import { dataSource, env } from './auth.datasource';

export const auth = betterAuth({
    name: 'Touring Club',
    baseURL: 'http://localhost:3000',
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,
    database: typeormAdapter(dataSource, {
        schema: 'auth',
        usePlural: true,
        transaction: true,
        entitiesDir: 'library/database/src/entities/auth',
    }),
    emailAndPassword: { enabled: true, requireEmailVerification: true, autoSignIn: true },
});
