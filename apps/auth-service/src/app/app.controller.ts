import { Body, Controller, Get, HttpStatus, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    ChangePasswordDto,
    ChangePasswordResponseDto,
    ForgotPasswordDto,
    ForgotPasswordResponseDto,
    GetMeResponseDto,
    ResetPasswordDto,
    ResetPasswordResponseDto,
    SignInDto,
    SignInResponseDto,
    SignOutResponseDto,
    SignUpDto,
    SignUpResponseDto,
    UpdateProfileDto,
    UpdateProfileResponseDto,
    VerifyEmailDto,
    VerifyEmailResponseDto,
} from './dto';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { AppService } from './app.service';
import type { Request, Response } from 'express';
import { ApiResource, ApiResourceExceptions } from '@tc/utils';
import { AuthGuard } from '@tc/auth';

@ApiTags('Auth')
@Controller('auth')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('me')
    @UseGuards(AuthGuard)
    @ApiResource({ type: GetMeResponseDto, operationId: 'getMe', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async getMe(@Req() req: Request) {
        return this.appService.getMe(req);
    }

    @Patch('me')
    @UseGuards(AuthGuard)
    @ApiResource({ type: UpdateProfileResponseDto, operationId: 'updateProfile', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
    async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
        return this.appService.updateProfile(req, dto);
    }

    @Post('change-password')
    @UseGuards(AuthGuard)
    @ApiResource({ type: ChangePasswordResponseDto, operationId: 'changePassword', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
    async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
        return this.appService.changePassword(req, dto);
    }

    @Post('sign-out')
    @ApiResource({ type: SignOutResponseDto, operationId: 'signOut', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.appService.signOut(req, res);
    }

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

    @Post('forgot-password')
    @AllowAnonymous()
    @ApiResource({ type: ForgotPasswordResponseDto, operationId: 'forgotPassword', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST)
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.appService.forgotPassword(dto);
    }

    @Post('reset-password')
    @AllowAnonymous()
    @ApiResource({ type: ResetPasswordResponseDto, operationId: 'resetPassword', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST)
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.appService.resetPassword(dto);
    }
}
