import { And, ILike, In, LessThanOrEqual, MoreThanOrEqual, Not, Trip, type DataSource } from '@tc/database';
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
        let find: jest.SpiedFunction<TripRepository['find']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            tripRepository = new TripRepository(dataSource);
            find = jest.spyOn(tripRepository, 'find').mockResolvedValue([]);
        });

        it('queries published public trips without optional filters', async () => {
            const trips = [{ id: 'trip-1' }] as Trip[];
            find.mockResolvedValue(trips);
            const result = await tripRepository.findPublishedPublic({});
            expect(find).toHaveBeenCalledWith({
                where: { status: 'published', visibility: 'public' },
                order: { startDate: 'ASC' },
            });
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
            expect(find).toHaveBeenCalledTimes(1);
            const options = find.mock.calls[0][0];
            expect(options.order).toEqual({ startDate: 'ASC' });
            expect(options.where).toMatchObject({
                status: 'published',
                visibility: 'public',
                destination: ILike('%California%'),
                startDate: And(MoreThanOrEqual(new Date('2026-07-01T00:00:00.000Z')), LessThanOrEqual(new Date('2026-08-01T00:00:00.000Z'))),
            });
            expect(options.where.categories).toMatchObject({ _type: 'raw', _objectLiteralParameters: { category: 'Road Trip' } });
            expect(options.where.tags).toMatchObject({ _type: 'raw', _objectLiteralParameters: { tag: 'coastal' } });
        });
    });

    describe('findTravelHistoryForUser', () => {
        let tripRepository: TripRepository;
        let find: jest.SpiedFunction<TripRepository['find']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            tripRepository = new TripRepository(dataSource);
            find = jest.spyOn(tripRepository, 'find').mockResolvedValue([]);
        });

        it('queries organized and joined trips ordered by startDate descending', async () => {
            const trips = [{ id: 'trip-1' }] as Trip[];
            find.mockResolvedValue(trips);
            const result = await tripRepository.findTravelHistoryForUser('user-1');
            expect(find).toHaveBeenCalledWith({
                where: [{ organizerId: 'user-1', status: Not('draft') }, { memberships: { userId: 'user-1', status: In(['active', 'left']) } }],
                order: { startDate: 'DESC' },
            });
            expect(result).toBe(trips);
        });
    });
});
