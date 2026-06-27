import { auth } from '@tc/auth';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { SignInDto, SignUpDto, VerifyEmailDto } from './dto';
import { AuthUtils } from './auth.utils';
import { CookieOptions, Response } from 'express';
import { AuthService } from '@thallesp/nestjs-better-auth';

@Injectable()
export class AppService {
    private readonly accessTokenMaxAge = 15 * 60 * 1000;
    private readonly sessionTokenMaxAge = 30 * 24 * 60 * 60 * 1000;
    private readonly cookieOptions: CookieOptions = { httpOnly: true, secure: true, sameSite: 'lax', path: '/' };
    private readonly logger = new Logger(AppService.name);

    constructor(private readonly authService: AuthService<typeof auth>) {}

    async setAuthCookies(response: Response, accessToken: string, sessionToken: string) {
        response.cookie('access-token', accessToken, { ...this.cookieOptions, maxAge: this.accessTokenMaxAge });
        response.cookie('refresh-token', sessionToken, { ...this.cookieOptions, maxAge: this.sessionTokenMaxAge });
    }

    async issueToken(token: string | null) {
        const headers = AuthUtils.getHeaders(token);
        const response = await this.authService.api.getToken({ headers });
        return response.token;
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
}
