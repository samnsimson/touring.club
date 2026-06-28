import { Test } from '@nestjs/testing';
import { AppController } from '../../src/app/app.controller';
import { AppService } from '../../src/app/app.service';

describe('AppController', () => {
    let controller: AppController;
    let appService: jest.Mocked<Pick<AppService, 'createTrip' | 'listMyTrips'>>;

    beforeAll(async () => {
        appService = {
            createTrip: jest.fn(),
            listMyTrips: jest.fn(),
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

    it('createTrip delegates to AppService', async () => {
        const dto = {
            title: 'Pacific Coast Highway',
            destination: 'California, USA',
            startDate: '2026-07-01T09:00:00.000Z',
            endDate: '2026-07-07T18:00:00.000Z',
            capacity: 12,
            visibility: 'public' as const,
        };
        appService.createTrip.mockResolvedValue({
            trip: {
                id: 'trip-1',
                organizerId: 'organizer-1',
                ...dto,
                description: null,
                meetingLocation: null,
                status: 'draft',
                coverImageUrls: [],
                categories: [],
                tags: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
            },
        });
        const req = { session: { userId: 'organizer-1', sub: 'organizer-1' } };
        await expect(controller.createTrip(req as never, dto)).resolves.toMatchObject({ trip: { id: 'trip-1' } });
        expect(appService.createTrip).toHaveBeenCalledWith('organizer-1', dto);
    });

    it('listMyTrips delegates to AppService', async () => {
        appService.listMyTrips.mockResolvedValue({ trips: [] });
        const req = { session: { userId: 'organizer-1', sub: 'organizer-1' } };
        await expect(controller.listMyTrips(req as never)).resolves.toEqual({ trips: [] });
        expect(appService.listMyTrips).toHaveBeenCalledWith('organizer-1');
    });
});
