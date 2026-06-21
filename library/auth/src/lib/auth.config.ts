import { betterAuth } from 'better-auth';
import { SnakeNamingStrategy } from '@tc/utils';
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
        namingStrategy: new SnakeNamingStrategy(),
        entitiesDir: 'library/database/src/entities/auth',
    }),
    emailAndPassword: { enabled: true, requireEmailVerification: true, autoSignIn: true },
});
