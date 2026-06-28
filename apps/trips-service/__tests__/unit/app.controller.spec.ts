import { Test } from '@nestjs/testing';
import { AppController } from '../../src/app/app.controller';
import { AppService } from '../../src/app/app.service';

jest.mock('@tc/auth', () => ({
    Public: () => () => undefined,
    CurrentSession: () => () => undefined,
}));

describe('AppController', () => {
    let controller: AppController;
    let appService: jest.Mocked<
        Pick<
            AppService,
            | 'createTrip'
            | 'listMyTrips'
            | 'getTrip'
            | 'updateTrip'
            | 'publishTrip'
            | 'cancelTrip'
            | 'archiveTrip'
            | 'discoverTrips'
            | 'getPublicTrip'
            | 'joinTrip'
            | 'leaveTrip'
            | 'listTripMembers'
            | 'approveMembership'
            | 'rejectMembership'
            | 'removeMembership'
        >
    >;

    beforeAll(async () => {
        appService = {
            createTrip: jest.fn(),
            listMyTrips: jest.fn(),
            getTrip: jest.fn(),
            updateTrip: jest.fn(),
            publishTrip: jest.fn(),
            cancelTrip: jest.fn(),
            archiveTrip: jest.fn(),
            discoverTrips: jest.fn(),
            getPublicTrip: jest.fn(),
            joinTrip: jest.fn(),
            leaveTrip: jest.fn(),
            listTripMembers: jest.fn(),
            approveMembership: jest.fn(),
            rejectMembership: jest.fn(),
            removeMembership: jest.fn(),
        };

        const app = await Test.createTestingModule({
            controllers: [AppController],
            providers: [{ provide: AppService, useValue: appService }],
        }).compile();

        controller = app.get<AppController>(AppController);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const organizerId = 'organizer-1';
    const participantId = 'participant-1';
    const tripResponse = { trip: { id: 'trip-1', organizerId: 'organizer-1', status: 'draft' } };
    const membershipResponse = { membership: { id: 'membership-1', tripId: 'trip-1', userId: 'participant-1', status: 'active' } };

    it('createTrip delegates to AppService', async () => {
        const dto = {
            title: 'Pacific Coast Highway',
            destination: 'California, USA',
            startDate: '2026-07-01T09:00:00.000Z',
            endDate: '2026-07-07T18:00:00.000Z',
            capacity: 12,
            visibility: 'public' as const,
        };
        appService.createTrip.mockResolvedValue(tripResponse as never);
        await expect(controller.createTrip(organizerId, dto)).resolves.toEqual(tripResponse);
        expect(appService.createTrip).toHaveBeenCalledWith('organizer-1', dto);
    });

    it('listMyTrips delegates to AppService', async () => {
        appService.listMyTrips.mockResolvedValue({ trips: [] });
        await expect(controller.listMyTrips(organizerId)).resolves.toEqual({ trips: [] });
        expect(appService.listMyTrips).toHaveBeenCalledWith('organizer-1');
    });

    it('getTrip delegates to AppService', async () => {
        appService.getTrip.mockResolvedValue(tripResponse as never);
        await expect(controller.getTrip(organizerId, 'trip-1')).resolves.toEqual(tripResponse);
        expect(appService.getTrip).toHaveBeenCalledWith('organizer-1', 'trip-1');
    });

    it('updateTrip delegates to AppService', async () => {
        appService.updateTrip.mockResolvedValue(tripResponse as never);
        await expect(controller.updateTrip(organizerId, 'trip-1', { title: 'Updated' })).resolves.toEqual(tripResponse);
        expect(appService.updateTrip).toHaveBeenCalledWith('organizer-1', 'trip-1', { title: 'Updated' });
    });

    it('publishTrip delegates to AppService', async () => {
        appService.publishTrip.mockResolvedValue({ trip: { ...tripResponse.trip, status: 'published' } } as never);
        await expect(controller.publishTrip(organizerId, 'trip-1')).resolves.toMatchObject({ trip: { status: 'published' } });
        expect(appService.publishTrip).toHaveBeenCalledWith('organizer-1', 'trip-1');
    });

    it('discoverTrips delegates to AppService', async () => {
        appService.discoverTrips.mockResolvedValue({ trips: [] });
        await expect(controller.discoverTrips({ destination: 'California' })).resolves.toEqual({ trips: [] });
        expect(appService.discoverTrips).toHaveBeenCalledWith({ destination: 'California' });
    });

    it('getPublicTrip delegates to AppService', async () => {
        appService.getPublicTrip.mockResolvedValue(tripResponse as never);
        await expect(controller.getPublicTrip('trip-1')).resolves.toEqual(tripResponse);
        expect(appService.getPublicTrip).toHaveBeenCalledWith('trip-1');
    });

    it('joinTrip delegates to AppService', async () => {
        appService.joinTrip.mockResolvedValue(membershipResponse as never);
        await expect(controller.joinTrip(participantId, 'trip-1')).resolves.toEqual(membershipResponse);
        expect(appService.joinTrip).toHaveBeenCalledWith('participant-1', 'trip-1');
    });

    it('listTripMembers delegates to AppService', async () => {
        appService.listTripMembers.mockResolvedValue({ members: [] });
        await expect(controller.listTripMembers(organizerId, 'trip-1')).resolves.toEqual({ members: [] });
        expect(appService.listTripMembers).toHaveBeenCalledWith('organizer-1', 'trip-1');
    });
});
