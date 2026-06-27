import { betterAuth } from 'better-auth';
import { usernameValidator } from '@tc/utils';
import { typeormAdapter } from '@hedystia/better-auth-typeorm';
import { AUTH_BASE_PATH, AUTH_BASE_URL } from './auth.constants';
import { dataSource, env } from './auth.datasource';
import { EmailService } from './email';
import { admin, bearer, emailOTP, openAPI, username, jwt } from 'better-auth/plugins';
import type { EmailSender } from './auth.contracts';

export interface CreateAuthOptions {
    emailService?: EmailSender;
}

export function createAuth(options: CreateAuthOptions = {}) {
    const emailService = options.emailService ?? new EmailService(env);
    return betterAuth({
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
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: true,
            revokeSessionsOnPasswordReset: true,
            sendResetPassword: async ({ user, url, token }) => {
                emailService.send({
                    to: user.email,
                    subject: 'Reset your Touring Club password',
                    text: `Use this link to reset your password: ${url}\n\nOr enter this token: ${token}`,
                });
            },
        },
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
                sendVerificationOTP: async ({ email, otp, type }) => {
                    emailService.send({
                        to: email,
                        subject: 'Your Touring Club verification code',
                        text: `Your verification code is ${otp}. It expires in 10 minutes.\n\nPurpose: ${type}`,
                    });
                },
            }),
        ],
    });
}

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = Auth['$Infer']['Session']['session'];
export type AuthUser = Auth['$Infer']['Session']['user'];
