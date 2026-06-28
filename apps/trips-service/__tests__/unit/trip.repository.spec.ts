import { Trip, type DataSource } from '@tc/database';
import { TripRepository } from '../../src/app/repositories/trip.repository';

describe('TripRepository', () => {
    it('extends BaseRepository with Trip entity', () => {
        const dataSource = { manager: {} } as DataSource;
        expect(new TripRepository(dataSource)).toBeInstanceOf(TripRepository);
    });

    describe('findByOrganizerId', () => {
        let tripRepository: TripRepository;
        let find: jest.SpiedFunction<TripRepository['find']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            tripRepository = new TripRepository(dataSource);
            find = jest.spyOn(tripRepository, 'find').mockResolvedValue([]);
        });

        it('queries by organizer id ordered by startDate ascending', async () => {
            const trips = [{ id: 'trip-1' }] as Trip[];
            find.mockResolvedValue(trips);
            const result = await tripRepository.findByOrganizerId('organizer-1');
            expect(find).toHaveBeenCalledWith({ where: { organizerId: 'organizer-1' }, order: { startDate: 'ASC' } });
            expect(result).toBe(trips);
        });
    });

    describe('findByIdForOrganizer', () => {
        let tripRepository: TripRepository;
        let findOne: jest.SpiedFunction<TripRepository['findOne']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            tripRepository = new TripRepository(dataSource);
            findOne = jest.spyOn(tripRepository, 'findOne').mockResolvedValue(null);
        });

        it('queries by trip id and organizer id', async () => {
            const trip = { id: 'trip-1', organizerId: 'organizer-1' } as Trip;
            findOne.mockResolvedValue(trip);
            const result = await tripRepository.findByIdForOrganizer('trip-1', 'organizer-1');
            expect(findOne).toHaveBeenCalledWith({ where: { id: 'trip-1', organizerId: 'organizer-1' } });
            expect(result).toBe(trip);
        });
    });

    describe('findById', () => {
        let tripRepository: TripRepository;
        let findOne: jest.SpiedFunction<TripRepository['findOne']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            tripRepository = new TripRepository(dataSource);
            findOne = jest.spyOn(tripRepository, 'findOne').mockResolvedValue(null);
        });

        it('queries by trip id', async () => {
            const trip = { id: 'trip-1' } as Trip;
            findOne.mockResolvedValue(trip);
            const result = await tripRepository.findById('trip-1');
            expect(findOne).toHaveBeenCalledWith({ where: { id: 'trip-1' } });
            expect(result).toBe(trip);
        });
    });

    describe('findPublishedById', () => {
        let tripRepository: TripRepository;
        let findOne: jest.SpiedFunction<TripRepository['findOne']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            tripRepository = new TripRepository(dataSource);
            findOne = jest.spyOn(tripRepository, 'findOne').mockResolvedValue(null);
        });

        it('queries published trips by id', async () => {
            const trip = { id: 'trip-1', status: 'published' } as Trip;
            findOne.mockResolvedValue(trip);
            const result = await tripRepository.findPublishedById('trip-1');
            expect(findOne).toHaveBeenCalledWith({ where: { id: 'trip-1', status: 'published' } });
            expect(result).toBe(trip);
        });
    });

    describe('findPublicById', () => {
        let tripRepository: TripRepository;
        let findOne: jest.SpiedFunction<TripRepository['findOne']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            tripRepository = new TripRepository(dataSource);
            findOne = jest.spyOn(tripRepository, 'findOne').mockResolvedValue(null);
        });

        it('queries published public trips by id', async () => {
            const trip = { id: 'trip-1', status: 'published', visibility: 'public' } as Trip;
            findOne.mockResolvedValue(trip);
            const result = await tripRepository.findPublicById('trip-1');
            expect(findOne).toHaveBeenCalledWith({ where: { id: 'trip-1', status: 'published', visibility: 'public' } });
            expect(result).toBe(trip);
        });
    });

    describe('findPublishedPublic', () => {
        let tripRepository: TripRepository;
        let queryBuilder: {
            where: jest.Mock;
            andWhere: jest.Mock;
            orderBy: jest.Mock;
            getMany: jest.Mock;
        };

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            tripRepository = new TripRepository(dataSource);
            queryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
            };
            jest.spyOn(tripRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as never);
        });

        it('queries published public trips without optional filters', async () => {
            const trips = [{ id: 'trip-1' }] as Trip[];
            queryBuilder.getMany.mockResolvedValue(trips);
            const result = await tripRepository.findPublishedPublic({});
            expect(tripRepository.createQueryBuilder).toHaveBeenCalledWith('trip');
            expect(queryBuilder.where).toHaveBeenCalledWith('trip.status = :status', { status: 'published' });
            expect(queryBuilder.andWhere).toHaveBeenCalledWith('trip.visibility = :visibility', { visibility: 'public' });
            expect(queryBuilder.orderBy).toHaveBeenCalledWith('trip.startDate', 'ASC');
            expect(result).toBe(trips);
        });

        it('applies optional discover filters', async () => {
            await tripRepository.findPublishedPublic({
                destination: 'California',
                startDateFrom: '2026-07-01T00:00:00.000Z',
                startDateTo: '2026-08-01T00:00:00.000Z',
                category: 'Road Trip',
                tag: 'coastal',
            });
            expect(queryBuilder.andWhere).toHaveBeenCalledWith('trip.destination ILIKE :destination', { destination: '%California%' });
            expect(queryBuilder.andWhere).toHaveBeenCalledWith('trip.startDate >= :startDateFrom', {
                startDateFrom: new Date('2026-07-01T00:00:00.000Z'),
            });
            expect(queryBuilder.andWhere).toHaveBeenCalledWith('trip.startDate <= :startDateTo', {
                startDateTo: new Date('2026-08-01T00:00:00.000Z'),
            });
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(':category = ANY(trip.categories)', { category: 'Road Trip' });
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(':tag = ANY(trip.tags)', { tag: 'coastal' });
        });
    });
});
