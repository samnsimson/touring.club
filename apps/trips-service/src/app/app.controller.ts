import { Body, Controller, Get, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@tc/auth';
import { ApiResource, ApiResourceExceptions } from '@tc/utils';
import { AppService } from './app.service';
import { CreateTripDto, CreateTripResponseDto, ListTripsResponseDto } from './dto';
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
}
