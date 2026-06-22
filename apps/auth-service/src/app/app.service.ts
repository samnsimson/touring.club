import { auth } from '@tc/auth';
import { Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { IncomingHttpHeaders } from 'node:http';
import { Response } from 'express';
import { SignInDto, SignUpDto, VerifyEmailDto } from './dto';
import { applyAuthHeaders, mapAuthError } from './auth.utils';

@Injectable()
export class AppService {
    async signUp(body: SignUpDto, headers: IncomingHttpHeaders, res: Response) {
        try {
            const returnHeaders = true;
            const nodeHeaders = fromNodeHeaders(headers);
            const response = await auth.api.signUpEmail({ body, headers: nodeHeaders, returnHeaders });
            applyAuthHeaders(response.headers, res);
            return response.response;
        } catch (error) {
            return mapAuthError(error);
        }
    }

    async signIn(dto: SignInDto, headers: IncomingHttpHeaders, res: Response) {
        try {
            const returnHeaders = true;
            const nodeHeaders = fromNodeHeaders(headers);
            const response = await auth.api.signInEmail({ body: dto, headers: nodeHeaders, returnHeaders });
            applyAuthHeaders(response.headers, res);
            return response.response;
        } catch (error) {
            return mapAuthError(error);
        }
    }

    async verifyEmail(dto: VerifyEmailDto, headers: IncomingHttpHeaders, res: Response) {
        try {
            const returnHeaders = true;
            const nodeHeaders = fromNodeHeaders(headers);
            const response = await auth.api.verifyEmailOTP({ body: dto, headers: nodeHeaders, returnHeaders });
            applyAuthHeaders(response.headers, res);
            return response.response;
        } catch (error) {
            return mapAuthError(error);
        }
    }
}
