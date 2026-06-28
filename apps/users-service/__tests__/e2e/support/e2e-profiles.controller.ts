import { Body, Controller, Get, HttpStatus, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@tc/auth';
import { ApiResource, ApiResourceExceptions } from '@tc/utils';
import { AppService } from '../../../src/app/app.service';
import { GetProfileResponseDto, GetPublicProfileResponseDto, TravelHistoryResponseDto, UpdateProfileDto, UpdateProfileResponseDto } from '../../../src/app/dto';
import { ProfileUtils } from '../../../src/app/profile.utils';
import { E2EAuthGuard } from './e2e-auth.guard';

@ApiTags('Profiles')
@Controller('profiles')
@UseGuards(E2EAuthGuard)
export class E2EProfilesController {
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
