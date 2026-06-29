import { Trip, type DataSource } from '@tc/database';
import { TripRepository } from '../../src/app/repositories/trip.repository';

describe('TripRepository', () => {
    let tripRepository: TripRepository;
    let findOne: jest.SpiedFunction<TripRepository['findOne']>;

    beforeEach(() => {
        const dataSource = { manager: {} } as DataSource;
        tripRepository = new TripRepository(dataSource);
        findOne = jest.spyOn(tripRepository, 'findOne').mockResolvedValue(null);
    });

    it('extends BaseRepository with Trip entity', () => {
        const dataSource = { manager: {} } as DataSource;
        expect(new TripRepository(dataSource)).toBeInstanceOf(TripRepository);
    });

    describe('findById', () => {
        it('queries by trip id', async () => {
            const trip = { id: 'trip-1' } as Trip;
            findOne.mockResolvedValue(trip);
            const result = await tripRepository.findById('trip-1');
            expect(findOne).toHaveBeenCalledWith({ where: { id: 'trip-1' } });
            expect(result).toBe(trip);
        });
    });
});
