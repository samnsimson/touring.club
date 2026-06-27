import { auth, AuthHeaders, AUTH_ACCESS_TOKEN_COOKIE, AUTH_REFRESH_TOKEN_COOKIE } from '@tc/auth';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { SignInDto, SignUpDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { AuthUtils } from './auth.utils';
import { CookieOptions, Request, Response } from 'express';
import { AuthService } from '@thallesp/nestjs-better-auth';

@Injectable()
export class AppService {
    private readonly accessTokenMaxAge = 15 * 60 * 1000;
    private readonly sessionTokenMaxAge = 30 * 24 * 60 * 60 * 1000;
    private readonly cookieOptions: CookieOptions = { httpOnly: true, secure: true, sameSite: 'lax', path: '/' };
    private readonly logger = new Logger(AppService.name);

    constructor(private readonly authService: AuthService<typeof auth>) {}

    async setAuthCookies(response: Response, accessToken: string, sessionToken: string) {
        response.cookie(AUTH_ACCESS_TOKEN_COOKIE, accessToken, { ...this.cookieOptions, maxAge: this.accessTokenMaxAge });
        response.cookie(AUTH_REFRESH_TOKEN_COOKIE, sessionToken, { ...this.cookieOptions, maxAge: this.sessionTokenMaxAge });
    }

    clearAuthCookies(response: Response) {
        response.clearCookie(AUTH_ACCESS_TOKEN_COOKIE, this.cookieOptions);
        response.clearCookie(AUTH_REFRESH_TOKEN_COOKIE, this.cookieOptions);
    }

    async issueToken(token: string | null) {
        const headers = AuthUtils.getHeaders(token);
        const response = await this.authService.api.getToken({ headers });
        return response.token;
    }

    async getMe(request: Request) {
        const session = await this.authService.api.getSession({ headers: AuthHeaders.fromRequest(request) });
        if (!session?.user) throw new UnauthorizedException('Not authenticated');
        return session.user;
    }

    async signOut(request: Request, response: Response) {
        if (!AuthHeaders.getSessionToken(request)) throw new UnauthorizedException('Not authenticated');
        await this.authService.api.signOut({ headers: AuthHeaders.fromRequest(request) });
        this.clearAuthCookies(response);
        return { success: true };
    }

    async signUp(dto: SignUpDto) {
        const response = await this.authService.api.signUpEmail({ body: { ...dto } });
        this.logger.log(`Sign up response: ${JSON.stringify(response)}`);
        if (!response.token) return { ...response.user };
        const accessToken = await this.issueToken(response.token);
        return { ...response.user, sessionToken: response.token, accessToken };
    }

    async signIn(dto: SignInDto) {
        const response = await this.authService.api.signInEmail({ body: { ...dto } });
        this.logger.log(`Sign in response: ${JSON.stringify(response)}`);
        if (!response.token) throw new UnauthorizedException('Failed to sign in');
        const accessToken = await this.issueToken(response.token);
        return { ...response.user, sessionToken: response.token, accessToken };
    }

    async verifyEmail(dto: VerifyEmailDto) {
        const response = await this.authService.api.verifyEmailOTP({ body: { ...dto } });
        this.logger.log(`Verify email response: ${JSON.stringify(response)}`);
        if (!response.token) throw new UnauthorizedException('Failed to verify email');
        const accessToken = await this.issueToken(response.token);
        return { ...response.user, sessionToken: response.token, accessToken };
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        try {
            await this.authService.api.requestPasswordReset({ body: dto });
        } catch (error) {
            this.logger.warn(`Forgot password request failed: ${String(error)}`);
        }
        return { success: true };
    }

    async resetPassword(dto: ResetPasswordDto) {
        await this.authService.api.resetPassword({ body: dto });
        return { success: true };
    }
}
