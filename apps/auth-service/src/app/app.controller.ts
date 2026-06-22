import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthErrorResponseDto, SignInDto, SignInResponseDto, SignUpDto, SignUpResponseDto, VerifyEmailDto, VerifyEmailResponseDto } from './dto';
import { AppService } from './app.service';
import * as express from 'express';

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
    signUp(@Body() dto: SignUpDto, @Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
        return this.appService.signUp(dto, req.headers, res);
    }

    @Post('sign-in')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ operationId: 'signIn', summary: 'Sign in with email and password' })
    @ApiOkResponse({ type: SignInResponseDto })
    @ApiBadRequestResponse({ type: AuthErrorResponseDto })
    @ApiUnauthorizedResponse({ type: AuthErrorResponseDto })
    signIn(@Body() dto: SignInDto, @Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
        return this.appService.signIn(dto, req.headers, res);
    }

    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ operationId: 'verifyEmail', summary: 'Verify email address using a one-time password' })
    @ApiOkResponse({ type: VerifyEmailResponseDto })
    @ApiBadRequestResponse({ type: AuthErrorResponseDto, description: 'Invalid or expired OTP' })
    verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
        return this.appService.verifyEmail(dto, req.headers, res);
    }
}
