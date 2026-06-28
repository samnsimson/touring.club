import { Body, Controller, Get, Headers, HttpStatus, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentSession } from '@tc/auth';
import { ApiResource, ApiResourceExceptions } from '@tc/utils';
import { AppService } from './app.service';
import { GetProfileResponseDto, GetPublicProfileResponseDto, TravelHistoryResponse, UpdateProfileDto, UpdateProfileResponseDto } from './dto';

@ApiTags('Profiles')
@Controller('profiles')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('me')
    @ApiResource({ type: GetProfileResponseDto, operationId: 'getMyProfile', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async getMyProfile(@CurrentSession('userId') userId: string) {
        return this.appService.getProfile(userId);
    }

    @Patch('me')
    @ApiResource({ type: UpdateProfileResponseDto, operationId: 'updateMyProfile', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
    async updateMyProfile(@CurrentSession('userId') userId: string, @Body() dto: UpdateProfileDto) {
        return this.appService.updateProfile(userId, dto);
    }

    @Get('me/travel-history')
    @ApiResource({ type: TravelHistoryResponse, operationId: 'getMyTravelHistory', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async getMyTravelHistory(@CurrentSession('userId') userId: string, @Headers('authorization') authorization: string) {
        return this.appService.getTravelHistory(userId, authorization);
    }

    @Get(':userId')
    @ApiResource({ type: GetPublicProfileResponseDto, operationId: 'getPublicProfile', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async getPublicProfile(@Param('userId') userId: string, @Headers('authorization') authorization: string) {
        return this.appService.getPublicProfile(userId, authorization);
    }
}
