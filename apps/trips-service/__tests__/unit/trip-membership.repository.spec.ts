import { TripMembership, type DataSource } from '@tc/database';
import { TripMembershipRepository } from '../../src/app/repositories/trip-membership.repository';

describe('TripMembershipRepository', () => {
    it('extends BaseRepository with TripMembership entity', () => {
        const dataSource = { manager: {} } as DataSource;
        expect(new TripMembershipRepository(dataSource)).toBeInstanceOf(TripMembershipRepository);
    });

    describe('findByTripId', () => {
        let membershipRepository: TripMembershipRepository;
        let find: jest.SpiedFunction<TripMembershipRepository['find']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            membershipRepository = new TripMembershipRepository(dataSource);
            find = jest.spyOn(membershipRepository, 'find').mockResolvedValue([]);
        });

        it('queries by trip id ordered by createdAt ascending', async () => {
            const members = [{ id: 'membership-1' }] as TripMembership[];
            find.mockResolvedValue(members);
            const result = await membershipRepository.findByTripId('trip-1');
            expect(find).toHaveBeenCalledWith({ where: { trip: { id: 'trip-1' } }, order: { createdAt: 'ASC' } });
            expect(result).toBe(members);
        });
    });

    describe('findByTripAndUser', () => {
        let membershipRepository: TripMembershipRepository;
        let findOne: jest.SpiedFunction<TripMembershipRepository['findOne']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            membershipRepository = new TripMembershipRepository(dataSource);
            findOne = jest.spyOn(membershipRepository, 'findOne').mockResolvedValue(null);
        });

        it('queries by trip id and user id', async () => {
            const membership = { id: 'membership-1', tripId: 'trip-1', userId: 'participant-1' } as TripMembership;
            findOne.mockResolvedValue(membership);
            const result = await membershipRepository.findByTripAndUser('trip-1', 'participant-1');
            expect(findOne).toHaveBeenCalledWith({ where: { trip: { id: 'trip-1' }, userId: 'participant-1' } });
            expect(result).toBe(membership);
        });
    });

    describe('findByIdForTrip', () => {
        let membershipRepository: TripMembershipRepository;
        let findOne: jest.SpiedFunction<TripMembershipRepository['findOne']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            membershipRepository = new TripMembershipRepository(dataSource);
            findOne = jest.spyOn(membershipRepository, 'findOne').mockResolvedValue(null);
        });

        it('queries by membership id and trip id', async () => {
            const membership = { id: 'membership-1', tripId: 'trip-1' } as TripMembership;
            findOne.mockResolvedValue(membership);
            const result = await membershipRepository.findByIdForTrip('membership-1', 'trip-1');
            expect(findOne).toHaveBeenCalledWith({ where: { id: 'membership-1', trip: { id: 'trip-1' } } });
            expect(result).toBe(membership);
        });
    });

    describe('countActiveMembers', () => {
        let membershipRepository: TripMembershipRepository;
        let count: jest.SpiedFunction<TripMembershipRepository['count']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            membershipRepository = new TripMembershipRepository(dataSource);
            count = jest.spyOn(membershipRepository, 'count').mockResolvedValue(0);
        });

        it('counts active members for a trip', async () => {
            count.mockResolvedValue(3);
            const result = await membershipRepository.countActiveMembers('trip-1');
            expect(count).toHaveBeenCalledWith({ where: { trip: { id: 'trip-1' }, status: 'active' } });
            expect(result).toBe(3);
        });
    });
});
