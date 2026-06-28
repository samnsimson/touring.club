import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@tc/auth';
import { Public } from '@tc/auth';
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
    TripMembershipActionResponseDto,
    UpdateTripDto,
    UpdateTripResponseDto,
} from './dto';
import { TripUtils } from './trip.utils';

@ApiTags('Trips')
@Controller('trips')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post()
    @ApiResource({ type: CreateTripResponseDto, operationId: 'createTrip', status: HttpStatus.CREATED })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
    async createTrip(@Req() req: AuthenticatedRequest, @Body() dto: CreateTripDto) {
        return this.appService.createTrip(TripUtils.getUserId(req), dto);
    }

    @Get()
    @ApiResource({ type: ListTripsResponseDto, operationId: 'listMyTrips', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async listMyTrips(@Req() req: AuthenticatedRequest) {
        return this.appService.listMyTrips(TripUtils.getUserId(req));
    }

    @Public()
    @Get('discover')
    @ApiResource({ type: DiscoverTripsResponseDto, operationId: 'discoverTrips', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST)
    async discoverTrips(@Query() query: DiscoverTripsQueryDto) {
        return this.appService.discoverTrips(query);
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
    async publishTrip(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string) {
        return this.appService.publishTrip(TripUtils.getUserId(req), tripId);
    }

    @Post(':tripId/cancel')
    @ApiResource({ type: GetTripResponseDto, operationId: 'cancelTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async cancelTrip(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string) {
        return this.appService.cancelTrip(TripUtils.getUserId(req), tripId);
    }

    @Post(':tripId/archive')
    @ApiResource({ type: GetTripResponseDto, operationId: 'archiveTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async archiveTrip(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string) {
        return this.appService.archiveTrip(TripUtils.getUserId(req), tripId);
    }

    @Post(':tripId/join')
    @ApiResource({ type: JoinTripResponseDto, operationId: 'joinTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async joinTrip(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string) {
        return this.appService.joinTrip(TripUtils.getUserId(req), tripId);
    }

    @Post(':tripId/leave')
    @ApiResource({ type: LeaveTripResponseDto, operationId: 'leaveTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async leaveTrip(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string) {
        return this.appService.leaveTrip(TripUtils.getUserId(req), tripId);
    }

    @Get(':tripId/members')
    @ApiResource({ type: ListTripMembersResponseDto, operationId: 'listTripMembers', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async listTripMembers(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string) {
        return this.appService.listTripMembers(TripUtils.getUserId(req), tripId);
    }

    @Post(':tripId/members/:membershipId/approve')
    @ApiResource({ type: TripMembershipActionResponseDto, operationId: 'approveMembership', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async approveMembership(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string, @Param('membershipId') membershipId: string) {
        return this.appService.approveMembership(TripUtils.getUserId(req), tripId, membershipId);
    }

    @Post(':tripId/members/:membershipId/reject')
    @ApiResource({ type: TripMembershipActionResponseDto, operationId: 'rejectMembership', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async rejectMembership(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string, @Param('membershipId') membershipId: string) {
        return this.appService.rejectMembership(TripUtils.getUserId(req), tripId, membershipId);
    }

    @Delete(':tripId/members/:membershipId')
    @ApiResource({ type: TripMembershipActionResponseDto, operationId: 'removeMembership', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async removeMembership(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string, @Param('membershipId') membershipId: string) {
        return this.appService.removeMembership(TripUtils.getUserId(req), tripId, membershipId);
    }

    @Get(':tripId')
    @ApiResource({ type: GetTripResponseDto, operationId: 'getTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async getTrip(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string) {
        return this.appService.getTrip(TripUtils.getUserId(req), tripId);
    }

    @Patch(':tripId')
    @ApiResource({ type: UpdateTripResponseDto, operationId: 'updateTrip', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async updateTrip(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string, @Body() dto: UpdateTripDto) {
        return this.appService.updateTrip(TripUtils.getUserId(req), tripId, dto);
    }
}
