import { Body, Controller, Get, HttpStatus, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard, type AuthenticatedRequest } from '@tc/auth';
import { ApiResource, ApiResourceExceptions } from '@tc/utils';
import { AppService } from './app.service';
import { GetProfileResponseDto, UpdateProfileDto, UpdateProfileResponseDto } from './dto';
import { ProfileUtils } from './profile.utils';

@ApiTags('Profiles')
@Controller('profiles')
@UseGuards(AuthGuard)
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('me')
    @ApiResource({ type: GetProfileResponseDto, operationId: 'getMyProfile', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async getMyProfile(@Req() req: AuthenticatedRequest) {
        return this.appService.getProfile(ProfileUtils.getUserId(req));
    }

    @Patch('me')
    @ApiResource({ type: UpdateProfileResponseDto, operationId: 'updateMyProfile', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
    async updateMyProfile(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
        return this.appService.updateProfile(ProfileUtils.getUserId(req), dto);
    }
}
