import { betterAuth } from 'better-auth';
import { SnakeNamingStrategy, usernameValidator } from '@tc/utils';
import { typeormAdapter } from './adapter/auth.adapter';
import { dataSource, env } from './auth.datasource';
import { admin, bearer, emailOTP, openAPI, username, jwt } from 'better-auth/plugins';

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
    onAPIError: { throw: true, onError: (error) => console.error(error) },
    emailAndPassword: { enabled: true, requireEmailVerification: true, autoSignIn: true },
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
