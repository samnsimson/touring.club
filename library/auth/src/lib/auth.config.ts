import { betterAuth } from 'better-auth';
import { usernameValidator } from '@tc/utils';
import { typeormAdapter } from '@hedystia/better-auth-typeorm';
import { AUTH_BASE_PATH, AUTH_BASE_URL } from './auth.constants';
import { dataSource, env } from './auth.datasource';
import { admin, bearer, emailOTP, openAPI, username, jwt } from 'better-auth/plugins';

export const auth = betterAuth({
    name: 'Touring Club',
    baseURL: AUTH_BASE_URL,
    basePath: AUTH_BASE_PATH,
    secret: env.BETTER_AUTH_SECRET,
    database: typeormAdapter(dataSource, {
        outputDir: 'library/database/src',
        entitiesDir: 'library/database/src/entities/auth',
        migrationsDir: 'library/database/src/migrations',
        usePlural: true,
    }),
    onAPIError: { throw: true, onError: (error) => console.error(error) },
    emailVerification: { autoSignInAfterVerification: true },
    emailAndPassword: { enabled: true, requireEmailVerification: true, revokeSessionsOnPasswordReset: true },
    plugins: [
        bearer(),
        openAPI({ path: '/docs' }),
        admin({ defaultRole: 'user' }),
        jwt({
            jwt: {
                definePayload: ({ session, user }) => ({
                    ...session,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    banned: user.banned,
                    banExpires: user.banExpires,
                }),
            },
        }),
        username({
            minUsernameLength: 3,
            maxUsernameLength: 16,
            usernameValidator: usernameValidator,
            usernameNormalization: (username) => username.toLowerCase().trim(),
            displayUsernameNormalization: (displayUsername) => displayUsername.toLowerCase().trim(),
        }),
        emailOTP({
            otpLength: 6,
            expiresIn: 10 * 60,
            sendVerificationOnSignUp: true,
            overrideDefaultEmailVerification: true,
            sendVerificationOTP: async ({ email, otp, type }) => console.log(`Sending OTP to ${email}: ${otp} for ${type}`),
        }),
    ],
});

export type Auth = typeof auth;
export type AuthSession = typeof auth.$Infer.Session.session;
export type AuthUser = typeof auth.$Infer.Session.user;
