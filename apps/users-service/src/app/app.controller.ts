import { Body, Controller, Get, HttpStatus, Param, Patch, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@tc/auth';
import { ApiResource, ApiResourceExceptions } from '@tc/utils';
import { AppService } from './app.service';
import { GetProfileResponseDto, GetPublicProfileResponseDto, TravelHistoryResponseDto, UpdateProfileDto, UpdateProfileResponseDto } from './dto';
import { ProfileUtils } from './profile.utils';

@ApiTags('Profiles')
@Controller('profiles')
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

    @Get('me/travel-history')
    @ApiResource({ type: TravelHistoryResponseDto, operationId: 'getMyTravelHistory', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async getMyTravelHistory(@Req() req: AuthenticatedRequest) {
        return this.appService.getTravelHistory(ProfileUtils.getUserId(req));
    }

    @Get(':userId')
    @ApiResource({ type: GetPublicProfileResponseDto, operationId: 'getPublicProfile', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async getPublicProfile(@Param('userId') userId: string) {
        return this.appService.getPublicProfile(userId);
    }
}
