import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthErrorResponseDto, SignInDto, SignInResponseDto, SignUpDto, SignUpResponseDto, VerifyEmailDto, VerifyEmailResponseDto } from './dto';
import { AppService } from './app.service';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post('sign-up')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ operationId: 'signUp', summary: 'Register a new user with email and password' })
    @ApiCreatedResponse({ type: SignUpResponseDto, description: 'User created; verification OTP sent when required' })
    @ApiBadRequestResponse({ type: AuthErrorResponseDto })
    @ApiConflictResponse({ type: AuthErrorResponseDto, description: 'Email or username already in use' })
    async signUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) res: Response) {
        const response = await this.appService.signUp(dto);
        await this.appService.setAuthCookies(res, response.accessToken, response.sessionToken);
        return response;
    }

    @Post('sign-in')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ operationId: 'signIn', summary: 'Sign in with email and password' })
    @ApiOkResponse({ type: SignInResponseDto })
    @ApiBadRequestResponse({ type: AuthErrorResponseDto })
    @ApiUnauthorizedResponse({ type: AuthErrorResponseDto })
    async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
        const response = await this.appService.signIn(dto);
        await this.appService.setAuthCookies(res, response.accessToken, response.sessionToken);
        return response;
    }

    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ operationId: 'verifyEmail', summary: 'Verify email address using a one-time password' })
    @ApiOkResponse({ type: VerifyEmailResponseDto })
    @ApiBadRequestResponse({ type: AuthErrorResponseDto, description: 'Invalid or expired OTP' })
    async verifyEmail(@Body() dto: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
        const response = await this.appService.verifyEmail(dto);
        await this.appService.setAuthCookies(res, response.accessToken, response.sessionToken);
        return response;
    }
}
