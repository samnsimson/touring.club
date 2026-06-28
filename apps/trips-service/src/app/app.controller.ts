import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@tc/auth';
import { ApiResource, ApiResourceExceptions } from '@tc/utils';
import { AppService } from './app.service';
import { CreateTripDto, CreateTripResponseDto, GetTripResponseDto, ListTripsResponseDto, UpdateTripDto, UpdateTripResponseDto } from './dto';
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
