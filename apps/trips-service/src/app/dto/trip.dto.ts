import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';
import { Trip, type TripStatus, type TripVisibility } from '@tc/database';

export type TripResponseInit = Pick<
    TripResponse,
    | 'id'
    | 'organizerId'
    | 'title'
    | 'description'
    | 'destination'
    | 'meetingLocation'
    | 'startDate'
    | 'endDate'
    | 'capacity'
    | 'visibility'
    | 'status'
    | 'coverImageUrls'
    | 'categories'
    | 'tags'
    | 'createdAt'
    | 'updatedAt'
>;

export class TripResponse {
    @ApiProperty({ example: 'trip_abc123' })
    id!: string;

    @ApiProperty({ example: 'usr_abc123' })
    organizerId!: string;

    @ApiProperty({ example: 'Pacific Coast Highway' })
    title!: string;

    @ApiProperty({ example: 'A scenic drive from SF to LA.', nullable: true })
    description!: string | null;

    @ApiProperty({ example: 'California, USA' })
    destination!: string;

    @ApiProperty({ example: 'San Francisco, CA', nullable: true })
    meetingLocation!: string | null;

    @ApiProperty({ example: '2026-07-01T09:00:00.000Z' })
    startDate!: Date;

    @ApiProperty({ example: '2026-07-07T18:00:00.000Z' })
    endDate!: Date;

    @ApiProperty({ example: 12 })
    capacity!: number;

    @ApiProperty({ example: 'public', enum: ['public', 'private'] })
    visibility!: TripVisibility;

    @ApiProperty({ example: 'draft', enum: ['draft', 'published', 'cancelled', 'archived'] })
    status!: TripStatus;

    @ApiProperty({ example: ['https://cdn.touring.club/trips/cover.jpg'], type: [String] })
    coverImageUrls!: string[];

    @ApiProperty({ example: ['Road Trips'], type: [String] })
    categories!: string[];

    @ApiProperty({ example: ['coastal', 'photography'], type: [String] })
    tags!: string[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    constructor(data: TripResponseInit) {
        Object.assign(this, data);
    }

    static from(trip: Trip): TripResponse {
        return new TripResponse({
            id: trip.id,
            organizerId: trip.organizerId,
            title: trip.title,
            description: trip.description,
            destination: trip.destination,
            meetingLocation: trip.meetingLocation,
            startDate: trip.startDate,
            endDate: trip.endDate,
            capacity: trip.capacity,
            visibility: trip.visibility,
            status: trip.status,
            coverImageUrls: trip.coverImageUrls,
            categories: trip.categories,
            tags: trip.tags,
            createdAt: trip.createdAt,
            updatedAt: trip.updatedAt,
        });
    }
}

export class CreateTripDto {
    @ApiProperty({ example: 'Pacific Coast Highway' })
    @IsString()
    @MaxLength(200)
    title!: string;

    @ApiPropertyOptional({ example: 'A scenic drive from SF to LA.' })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    description?: string;

    @ApiProperty({ example: 'California, USA' })
    @IsString()
    @MaxLength(200)
    destination!: string;

    @ApiPropertyOptional({ example: 'San Francisco, CA' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    meetingLocation?: string;

    @ApiProperty({ example: '2026-07-01T09:00:00.000Z' })
    @IsDateString()
    startDate!: string;

    @ApiProperty({ example: '2026-07-07T18:00:00.000Z' })
    @IsDateString()
    endDate!: string;

    @ApiProperty({ example: 12 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10_000)
    capacity!: number;

    @ApiProperty({ example: 'public', enum: ['public', 'private'] })
    @IsIn(['public', 'private'])
    visibility!: TripVisibility;

    @ApiPropertyOptional({ example: ['https://cdn.touring.club/trips/cover.jpg'], type: [String] })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(10)
    @IsUrl({ require_protocol: true }, { each: true })
    @MaxLength(2048, { each: true })
    coverImageUrls?: string[];

    @ApiPropertyOptional({ example: ['Road Trips'], type: [String] })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    @MaxLength(64, { each: true })
    categories?: string[];

    @ApiPropertyOptional({ example: ['coastal', 'photography'], type: [String] })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    @MaxLength(64, { each: true })
    tags?: string[];
}

export class CreateTripResponseDto {
    @ApiProperty({ type: TripResponse })
    trip!: TripResponse;
}

export class ListTripsResponseDto {
    @ApiProperty({ type: [TripResponse] })
    trips!: TripResponse[];
}

export class GetTripResponseDto {
    @ApiProperty({ type: TripResponse })
    trip!: TripResponse;
}

export class UpdateTripDto {
    @ApiPropertyOptional({ example: 'Pacific Coast Highway' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    title?: string;

    @ApiPropertyOptional({ example: 'A scenic drive from SF to LA.' })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    description?: string | null;

    @ApiPropertyOptional({ example: 'California, USA' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    destination?: string;

    @ApiPropertyOptional({ example: 'San Francisco, CA' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    meetingLocation?: string | null;

    @ApiPropertyOptional({ example: '2026-07-01T09:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ example: '2026-07-07T18:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ example: 12 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10_000)
    capacity?: number;

    @ApiPropertyOptional({ example: 'public', enum: ['public', 'private'] })
    @IsOptional()
    @IsIn(['public', 'private'])
    visibility?: TripVisibility;

    @ApiPropertyOptional({ example: ['https://cdn.touring.club/trips/cover.jpg'], type: [String] })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(10)
    @IsUrl({ require_protocol: true }, { each: true })
    @MaxLength(2048, { each: true })
    coverImageUrls?: string[];

    @ApiPropertyOptional({ example: ['Road Trips'], type: [String] })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    @MaxLength(64, { each: true })
    categories?: string[];

    @ApiPropertyOptional({ example: ['coastal', 'photography'], type: [String] })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    @MaxLength(64, { each: true })
    tags?: string[];
}

export class UpdateTripResponseDto {
    @ApiProperty({ type: TripResponse })
    trip!: TripResponse;
}

export type DiscoverTripsFilters = {
    destination?: string;
    startDateFrom?: string;
    startDateTo?: string;
    category?: string;
    tag?: string;
};

export class DiscoverTripsQueryDto implements DiscoverTripsFilters {
    @ApiPropertyOptional({ example: 'California' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    destination?: string;

    @ApiPropertyOptional({ example: '2026-07-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    startDateFrom?: string;

    @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
    @IsOptional()
    @IsDateString()
    startDateTo?: string;

    @ApiPropertyOptional({ example: 'Road Trips' })
    @IsOptional()
    @IsString()
    @MaxLength(64)
    category?: string;

    @ApiPropertyOptional({ example: 'coastal' })
    @IsOptional()
    @IsString()
    @MaxLength(64)
    tag?: string;
}

export class DiscoverTripsResponseDto {
    @ApiProperty({ type: [TripResponse] })
    trips!: TripResponse[];
}
