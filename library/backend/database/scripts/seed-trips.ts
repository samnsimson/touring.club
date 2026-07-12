import { dataSource } from './database.datasource';
import { Trip } from '../src/entities/general/Trip';

const SEED_ORGANIZER_ID = 'seed-organizer-1';

const trips: Array<
    Pick<
        Trip,
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
    >
> = [
    {
        title: 'Torres del Paine Backcountry Trek',
        description:
            'Five days circling the granite spires of Torres del Paine. Camp under the stars, cross suspension bridges, and watch condors ride the wind above the W Circuit.',
        destination: 'Patagonia, Chile',
        meetingLocation: 'Puerto Natales Bus Terminal',
        startDate: new Date('2026-09-12T09:00:00.000Z'),
        endDate: new Date('2026-09-17T18:00:00.000Z'),
        capacity: 10,
        visibility: 'public',
        status: 'published',
        coverImageUrls: ['https://picsum.photos/seed/patagonia-trek/900/600'],
        categories: ['Hiking', 'Adventure Travel'],
        tags: ['camping', 'multi-day', 'mountains'],
    },
    {
        title: 'Pacific Coast Highway Road Trip',
        description:
            'A leisurely four-day convoy from San Francisco to Los Angeles, with stops at Big Sur, Hearst Castle, and every clifftop pullout worth a photo.',
        destination: 'California, USA',
        meetingLocation: 'Golden Gate Bridge Welcome Center',
        startDate: new Date('2026-08-02T09:00:00.000Z'),
        endDate: new Date('2026-08-05T18:00:00.000Z'),
        capacity: 16,
        visibility: 'public',
        status: 'published',
        coverImageUrls: ['https://picsum.photos/seed/pch-roadtrip/900/600'],
        categories: ['Road Trip', 'Photography'],
        tags: ['coastal', 'scenic-drive', 'group-convoy'],
    },
    {
        title: 'Kyoto Backstreets Food Crawl',
        description: 'A three-night culinary deep-dive through Nishiki Market, hidden izakayas, and a 6am visit to the Kyoto wholesale fish auction.',
        destination: 'Kyoto, Japan',
        meetingLocation: 'Kyoto Station Central Gate',
        startDate: new Date('2026-10-21T09:00:00.000Z'),
        endDate: new Date('2026-10-24T18:00:00.000Z'),
        capacity: 12,
        visibility: 'public',
        status: 'published',
        coverImageUrls: ['https://picsum.photos/seed/kyoto-food/900/600'],
        categories: ['Food Tour', 'Photography'],
        tags: ['street-food', 'walking-tour', 'evenings'],
    },
    {
        title: 'Zion & Bryce Canyon Parks Loop',
        description: 'Six days chasing red rock — Angels Landing at sunrise, the Narrows in the afternoon, and a night of stargazing at Bryce Canyon.',
        destination: 'Utah, USA',
        meetingLocation: 'Las Vegas Airport, Terminal 1',
        startDate: new Date('2026-09-28T09:00:00.000Z'),
        endDate: new Date('2026-10-03T18:00:00.000Z'),
        capacity: 14,
        visibility: 'public',
        status: 'published',
        coverImageUrls: ['https://picsum.photos/seed/zion-bryce/900/600'],
        categories: ['National Parks', 'Hiking'],
        tags: ['national-park', 'desert', 'camping'],
    },
    {
        title: 'Kerala Backwaters & Spice Route',
        description: 'Houseboat nights on the backwaters, a spice plantation tour, and a home-cooked Keralan feast with a local family.',
        destination: 'Kerala, India',
        meetingLocation: 'Kochi International Airport',
        startDate: new Date('2026-11-14T09:00:00.000Z'),
        endDate: new Date('2026-11-19T18:00:00.000Z'),
        capacity: 10,
        visibility: 'public',
        status: 'published',
        coverImageUrls: ['https://picsum.photos/seed/kerala-backwaters/900/600'],
        categories: ['Food Tour', 'Adventure Travel'],
        tags: ['houseboat', 'culture', 'cuisine'],
    },
    {
        title: 'Norwegian Fjords Sea Kayak Expedition',
        description: 'Paddle beneath thousand-meter cliffs, camp on remote skerries, and chase the midnight sun across the Lysefjord.',
        destination: 'Bergen, Norway',
        meetingLocation: 'Bergen Harbor, Pier 4',
        startDate: new Date('2026-07-18T09:00:00.000Z'),
        endDate: new Date('2026-07-23T18:00:00.000Z'),
        capacity: 8,
        visibility: 'public',
        status: 'published',
        coverImageUrls: ['https://picsum.photos/seed/norway-fjords/900/600'],
        categories: ['Adventure Travel', 'Photography'],
        tags: ['kayaking', 'camping', 'midnight-sun'],
    },
    {
        title: 'Sahara Desert Stargazing Trek',
        description: 'Camel trek into the dunes of Merzouga, a Berber camp dinner, and a night sky with zero light pollution.',
        destination: 'Merzouga, Morocco',
        meetingLocation: 'Marrakesh Menara Airport',
        startDate: new Date('2026-12-05T09:00:00.000Z'),
        endDate: new Date('2026-12-08T18:00:00.000Z'),
        capacity: 12,
        visibility: 'public',
        status: 'published',
        coverImageUrls: ['https://picsum.photos/seed/sahara-trek/900/600'],
        categories: ['Adventure Travel', 'Photography'],
        tags: ['desert', 'camping', 'cultural'],
    },
    {
        title: 'Colorado Rockies Summit Hike',
        description: 'A weekend bagging two 14ers near Denver, with a basecamp cookout and ridge-line sunrise on day two.',
        destination: 'Rocky Mountain National Park, CO',
        meetingLocation: 'Estes Park Visitor Center',
        startDate: new Date('2026-08-15T09:00:00.000Z'),
        endDate: new Date('2026-08-17T18:00:00.000Z'),
        capacity: 10,
        visibility: 'public',
        status: 'published',
        coverImageUrls: ['https://picsum.photos/seed/rockies-summit/900/600'],
        categories: ['Hiking', 'National Parks'],
        tags: ['high-altitude', 'weekend', 'camping'],
    },
    {
        title: 'Bali Rice Terrace Photo Tour',
        description: 'Golden-hour shoots at Tegallalang and Jatiluwih, a waterfall hike, and an evening editing workshop with local photographers.',
        destination: 'Ubud, Bali',
        meetingLocation: 'Ubud Palace',
        startDate: new Date('2026-09-05T09:00:00.000Z'),
        endDate: new Date('2026-09-09T18:00:00.000Z'),
        capacity: 8,
        visibility: 'public',
        status: 'published',
        coverImageUrls: ['https://picsum.photos/seed/bali-rice/900/600'],
        categories: ['Photography', 'Adventure Travel'],
        tags: ['workshop', 'sunrise', 'small-group'],
    },
    {
        title: 'Mount Evans Sunrise Drive (Draft)',
        description: 'A short scenic drive idea for early next season — still working out logistics and permits.',
        destination: 'Mount Evans, CO',
        meetingLocation: null,
        startDate: new Date('2027-06-20T09:00:00.000Z'),
        endDate: new Date('2027-06-20T18:00:00.000Z'),
        capacity: 6,
        visibility: 'private',
        status: 'draft',
        coverImageUrls: ['https://picsum.photos/seed/mount-evans/900/600'],
        categories: ['Road Trip', 'Photography'],
        tags: ['sunrise', 'scenic-drive'],
    },
];

async function seed() {
    await dataSource.initialize();
    const repository = dataSource.getRepository(Trip);

    await repository.delete({ organizerId: SEED_ORGANIZER_ID });
    const rows = repository.create(trips.map((trip) => ({ ...trip, organizerId: SEED_ORGANIZER_ID })));
    await repository.save(rows);

    console.log(`Seeded ${rows.length} trips (organizerId: ${SEED_ORGANIZER_ID}).`);
    await dataSource.destroy();
}

seed().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
