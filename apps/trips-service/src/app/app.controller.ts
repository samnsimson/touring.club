import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentSession, Public } from '@tc/auth';
import { ApiResource, ApiResourceExceptions } from '@tc/utils';
import { AppService } from './app.service';
import {
    CreateTripDto,
    CreateTripResponseDto,
    DiscoverTripsQueryDto,
    DiscoverTripsResponseDto,
    GetTripResponseDto,
    JoinTripResponseDto,
    LeaveTripResponseDto,
    ListTripMembersResponseDto,
    ListTripsResponseDto,
    TravelHistoryResponseDto,
    TripMembershipActionResponseDto,
    UpdateTripDto,
    UpdateTripResponseDto,
} from './dto';

@ApiTags('Trips')
@Controller('trips')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post()
    @ApiResource({ type: CreateTripResponseDto, operationId: 'createTrip', status: HttpStatus.CREATED })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
    async createTrip(@CurrentSession('userId') userId: string, @Body() dto: CreateTripDto) {
        return this.appService.createTrip(userId, dto);
    }

    @Get()
    @ApiResource({ type: ListTripsResponseDto, operationId: 'listMyTrips', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async listMyTrips(@CurrentSession('userId') userId: string) {
        return this.appService.listMyTrips(userId);
    }

    @Public()
    @Get('discover')
    @ApiResource({ type: DiscoverTripsResponseDto, operationId: 'discoverTrips', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST)
    async discoverTrips(@Query() query: DiscoverTripsQueryDto) {
        return this.appService.discoverTrips(query);
    }

    @Get('users/:userId/travel-history')
    @ApiResource({ type: TravelHistoryResponseDto, operationId: 'getUserTravelHistory', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async getTravelHistory(@Param('userId') userId: string) {
        return this.appService.getTravelHistory(userId);
    }

    @Public()
    @Get('discover/:tripId')
    @ApiResource({ type: GetTripResponseDto, operationId: 'getPublicTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND)
    async getPublicTrip(@Param('tripId') tripId: string) {
        return this.appService.getPublicTrip(tripId);
    }

    @Post(':tripId/publish')
    @ApiResource({ type: GetTripResponseDto, operationId: 'publishTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async publishTrip(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string) {
        return this.appService.publishTrip(userId, tripId);
    }

    @Post(':tripId/cancel')
    @ApiResource({ type: GetTripResponseDto, operationId: 'cancelTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async cancelTrip(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string) {
        return this.appService.cancelTrip(userId, tripId);
    }

    @Post(':tripId/archive')
    @ApiResource({ type: GetTripResponseDto, operationId: 'archiveTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async archiveTrip(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string) {
        return this.appService.archiveTrip(userId, tripId);
    }

    @Post(':tripId/join')
    @ApiResource({ type: JoinTripResponseDto, operationId: 'joinTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async joinTrip(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string) {
        return this.appService.joinTrip(userId, tripId);
    }

    @Post(':tripId/leave')
    @ApiResource({ type: LeaveTripResponseDto, operationId: 'leaveTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async leaveTrip(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string) {
        return this.appService.leaveTrip(userId, tripId);
    }

    @Get(':tripId/members')
    @ApiResource({ type: ListTripMembersResponseDto, operationId: 'listTripMembers', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async listTripMembers(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string) {
        return this.appService.listTripMembers(userId, tripId);
    }

    @Post(':tripId/members/:membershipId/approve')
    @ApiResource({ type: TripMembershipActionResponseDto, operationId: 'approveMembership', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async approveMembership(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string, @Param('membershipId') membershipId: string) {
        return this.appService.approveMembership(userId, tripId, membershipId);
    }

    @Post(':tripId/members/:membershipId/reject')
    @ApiResource({ type: TripMembershipActionResponseDto, operationId: 'rejectMembership', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async rejectMembership(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string, @Param('membershipId') membershipId: string) {
        return this.appService.rejectMembership(userId, tripId, membershipId);
    }

    @Delete(':tripId/members/:membershipId')
    @ApiResource({ type: TripMembershipActionResponseDto, operationId: 'removeMembership', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async removeMembership(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string, @Param('membershipId') membershipId: string) {
        return this.appService.removeMembership(userId, tripId, membershipId);
    }

    @Get(':tripId')
    @ApiResource({ type: GetTripResponseDto, operationId: 'getTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async getTrip(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string) {
        return this.appService.getTrip(userId, tripId);
    }

    @Patch(':tripId')
    @ApiResource({ type: UpdateTripResponseDto, operationId: 'updateTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async updateTrip(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string, @Body() dto: UpdateTripDto) {
        return this.appService.updateTrip(userId, tripId, dto);
    }
}
