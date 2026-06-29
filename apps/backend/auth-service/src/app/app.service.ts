import type { Auth } from '@tc/auth';
import { AuthHeaders, AUTH_ACCESS_TOKEN_COOKIE, AUTH_REFRESH_TOKEN_COOKIE } from '@tc/auth';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import {
    AuthSessionResponse,
    AuthUserResponse,
    ChangePasswordDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    SignInDto,
    SignUpDto,
    SignUpResponse,
    UpdateProfileDto,
    VerifyEmailDto,
} from './dto';
import { AuthUtils } from './auth.utils';
import { CookieOptions, Request, Response } from 'express';
import { AuthService } from '@thallesp/nestjs-better-auth';

@Injectable()
export class AppService {
    private readonly accessTokenMaxAge = 15 * 60 * 1000;
    private readonly sessionTokenMaxAge = 30 * 24 * 60 * 60 * 1000;
    private readonly cookieOptions: CookieOptions = { httpOnly: true, secure: true, sameSite: 'lax', path: '/' };
    private readonly logger = new Logger(AppService.name);

    constructor(private readonly authService: AuthService<Auth>) {}

    setAuthCookies(response: Response, accessToken: string, sessionToken: string) {
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
        if (!AuthHeaders.getSessionToken(request) && !AuthHeaders.getAccessToken(request)) throw new UnauthorizedException('Not authenticated');
        const session = await this.authService.api.getSession({ headers: AuthHeaders.fromRequest(request) });
        if (!session?.user) throw new UnauthorizedException('Not authenticated');
        return AuthUserResponse.from(session.user);
    }

    async signOut(request: Request, response: Response) {
        if (!AuthHeaders.getSessionToken(request)) throw new UnauthorizedException('Not authenticated');
        await this.authService.api.signOut({ headers: AuthHeaders.fromRequest(request) });
        this.clearAuthCookies(response);
        return { success: true };
    }

    async signUp(dto: SignUpDto): Promise<SignUpResponse> {
        const response = await this.authService.api.signUpEmail({ body: { ...dto } });
        this.logger.log(`Sign up response: ${JSON.stringify(response)}`);
        if (!response.token) return SignUpResponse.fromSignUp(response.user);
        const accessToken = await this.issueToken(response.token);
        return SignUpResponse.fromSignUp(response.user, response.token, accessToken);
    }

    async signIn(dto: SignInDto) {
        const response = await this.authService.api.signInEmail({ body: { ...dto } });
        this.logger.log(`Sign in response: ${JSON.stringify(response)}`);
        if (!response.token) throw new UnauthorizedException('Failed to sign in');
        const accessToken = await this.issueToken(response.token);
        return AuthSessionResponse.fromAuth(response.user, response.token, accessToken);
    }

    async verifyEmail(dto: VerifyEmailDto) {
        const response = await this.authService.api.verifyEmailOTP({ body: { ...dto } });
        this.logger.log(`Verify email response: ${JSON.stringify(response)}`);
        if (!response.token) throw new UnauthorizedException('Failed to verify email');
        const accessToken = await this.issueToken(response.token);
        return AuthSessionResponse.fromAuth(response.user, response.token, accessToken);
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        try {
            await this.authService.api.requestPasswordReset({ body: { ...dto } });
        } catch (error) {
            this.logger.warn(`Password reset request failed for ${dto.email}: ${error instanceof Error ? error.message : String(error)}`);
        }
        return { success: true };
    }

    async resetPassword(dto: ResetPasswordDto) {
        await this.authService.api.resetPassword({ body: { ...dto } });
        return { success: true };
    }

    async changePassword(request: Request, dto: ChangePasswordDto) {
        if (!AuthHeaders.getSessionToken(request)) throw new UnauthorizedException('Not authenticated');
        await this.authService.api.changePassword({ body: { ...dto }, headers: AuthHeaders.fromRequest(request) });
        return { success: true };
    }

    async updateProfile(request: Request, dto: UpdateProfileDto) {
        if (!AuthHeaders.getSessionToken(request)) throw new UnauthorizedException('Not authenticated');
        await this.authService.api.updateUser({ body: { ...dto }, headers: AuthHeaders.fromRequest(request) });
        const user = await this.getMe(request);
        return { user };
    }
}
