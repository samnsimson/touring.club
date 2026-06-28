import { TripMembership, type DataSource } from '@tc/database';
import { TripMembershipRepository } from '../../src/app/repositories/trip-membership.repository';

describe('TripMembershipRepository', () => {
    let membershipRepository: TripMembershipRepository;
    let findOne: jest.SpiedFunction<TripMembershipRepository['findOne']>;
    let find: jest.SpiedFunction<TripMembershipRepository['find']>;

    beforeEach(() => {
        const dataSource = { manager: {} } as DataSource;
        membershipRepository = new TripMembershipRepository(dataSource);
        findOne = jest.spyOn(membershipRepository, 'findOne').mockResolvedValue(null);
        find = jest.spyOn(membershipRepository, 'find').mockResolvedValue([]);
    });

    it('extends BaseRepository with TripMembership entity', () => {
        const dataSource = { manager: {} } as DataSource;
        expect(new TripMembershipRepository(dataSource)).toBeInstanceOf(TripMembershipRepository);
    });

    describe('findByTripAndUser', () => {
        it('queries by trip id and user id', async () => {
            const membership = { id: 'membership-1', tripId: 'trip-1', userId: 'user-a', status: 'active' } as TripMembership;
            findOne.mockResolvedValue(membership);
            const result = await membershipRepository.findByTripAndUser('trip-1', 'user-a');
            expect(findOne).toHaveBeenCalledWith({ where: { trip: { id: 'trip-1' }, userId: 'user-a' } });
            expect(result).toBe(membership);
        });
    });

    describe('findActiveByTripId', () => {
        it('queries active memberships for a trip ordered by createdAt ascending', async () => {
            const memberships = [{ id: 'membership-1', tripId: 'trip-1', userId: 'user-b', status: 'active' }] as TripMembership[];
            find.mockResolvedValue(memberships);
            const result = await membershipRepository.findActiveByTripId('trip-1');
            expect(find).toHaveBeenCalledWith({ where: { trip: { id: 'trip-1' }, status: 'active' }, order: { createdAt: 'ASC' } });
            expect(result).toBe(memberships);
        });
    });
});
