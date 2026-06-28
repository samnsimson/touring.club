import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository, Trip, type DataSource } from '@tc/database';

@Injectable()
export class TripRepository extends BaseRepository<Trip> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        super(Trip, dataSource);
    }

    findById(tripId: string) {
        return this.findOne({ where: { id: tripId } });
    }
}
