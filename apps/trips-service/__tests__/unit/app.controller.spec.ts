import { Test } from '@nestjs/testing';
import { AppController } from '../../src/app/app.controller';
import { AppService } from '../../src/app/app.service';

describe('AppController', () => {
    let controller: AppController;
    let appService: jest.Mocked<Pick<AppService, 'createTrip' | 'listMyTrips' | 'getTrip' | 'updateTrip' | 'publishTrip' | 'cancelTrip' | 'archiveTrip'>>;

    beforeAll(async () => {
        appService = {
            createTrip: jest.fn(),
            listMyTrips: jest.fn(),
            getTrip: jest.fn(),
            updateTrip: jest.fn(),
            publishTrip: jest.fn(),
            cancelTrip: jest.fn(),
            archiveTrip: jest.fn(),
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

    const req = { session: { userId: 'organizer-1', sub: 'organizer-1' } } as never;
    const tripResponse = { trip: { id: 'trip-1', organizerId: 'organizer-1', status: 'draft' } };

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
        await expect(controller.createTrip(req, dto)).resolves.toEqual(tripResponse);
        expect(appService.createTrip).toHaveBeenCalledWith('organizer-1', dto);
    });

    it('listMyTrips delegates to AppService', async () => {
        appService.listMyTrips.mockResolvedValue({ trips: [] });
        await expect(controller.listMyTrips(req)).resolves.toEqual({ trips: [] });
        expect(appService.listMyTrips).toHaveBeenCalledWith('organizer-1');
    });

    it('getTrip delegates to AppService', async () => {
        appService.getTrip.mockResolvedValue(tripResponse as never);
        await expect(controller.getTrip(req, 'trip-1')).resolves.toEqual(tripResponse);
        expect(appService.getTrip).toHaveBeenCalledWith('organizer-1', 'trip-1');
    });

    it('updateTrip delegates to AppService', async () => {
        appService.updateTrip.mockResolvedValue(tripResponse as never);
        await expect(controller.updateTrip(req, 'trip-1', { title: 'Updated' })).resolves.toEqual(tripResponse);
        expect(appService.updateTrip).toHaveBeenCalledWith('organizer-1', 'trip-1', { title: 'Updated' });
    });

    it('publishTrip delegates to AppService', async () => {
        appService.publishTrip.mockResolvedValue({ trip: { ...tripResponse.trip, status: 'published' } } as never);
        await expect(controller.publishTrip(req, 'trip-1')).resolves.toMatchObject({ trip: { status: 'published' } });
        expect(appService.publishTrip).toHaveBeenCalledWith('organizer-1', 'trip-1');
    });
});
