import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SignInDto, SignInResponseDto, SignUpDto, SignUpResponseDto, VerifyEmailDto, VerifyEmailResponseDto } from './dto';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { AppService } from './app.service';
import type { Response } from 'express';
import { ApiResource, ApiResourceExceptions } from '@tc/utils';

@ApiTags('Auth')
@Controller('auth')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post('sign-up')
    @AllowAnonymous()
    @ApiResource({ type: SignUpResponseDto, operationId: 'signUp', status: HttpStatus.CREATED })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT)
    async signUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) res: Response) {
        const response = await this.appService.signUp(dto);
        const isTokensInResponse = 'sessionToken' in response && 'accessToken' in response;
        if (isTokensInResponse) await this.appService.setAuthCookies(res, response.accessToken, response.sessionToken);
        return response;
    }

    @Post('sign-in')
    @AllowAnonymous()
    @ApiResource({ type: SignInResponseDto, operationId: 'signIn', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
    async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
        const response = await this.appService.signIn(dto);
        await this.appService.setAuthCookies(res, response.accessToken, response.sessionToken);
        return response;
    }

    @Post('verify-email')
    @AllowAnonymous()
    @ApiResource({ type: VerifyEmailResponseDto, operationId: 'verifyEmail', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST)
    async verifyEmail(@Body() dto: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
        const response = await this.appService.verifyEmail(dto);
        await this.appService.setAuthCookies(res, response.accessToken, response.sessionToken);
        return response;
    }
}
