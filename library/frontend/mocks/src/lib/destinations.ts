import type { Destination } from './types';

export const mockDestinations: Destination[] = [
    {
        id: 'dest-1',
        name: 'Patagonia',
        country: 'Chile',
        imageUrl: 'https://picsum.photos/seed/dest-patagonia/600/700',
        tripCount: 6,
        description: 'Granite towers, glacial lakes, and some of the best backcountry trekking on Earth.',
    },
    {
        id: 'dest-2',
        name: 'Kyoto',
        country: 'Japan',
        imageUrl: 'https://picsum.photos/seed/dest-kyoto/600/700',
        tripCount: 9,
        description: 'Temples, backstreet izakayas, and a food scene built for slow, curious travelers.',
    },
    {
        id: 'dest-3',
        name: 'Bergen',
        country: 'Norway',
        imageUrl: 'https://picsum.photos/seed/dest-bergen/600/700',
        tripCount: 4,
        description: 'Fjords, midnight sun, and sea kayaking routes that feel like another planet.',
    },
    {
        id: 'dest-4',
        name: 'Merzouga',
        country: 'Morocco',
        imageUrl: 'https://picsum.photos/seed/dest-merzouga/600/700',
        tripCount: 5,
        description: 'Dune camps, camel treks, and the clearest night sky you will ever stand under.',
    },
    {
        id: 'dest-5',
        name: 'Ubud',
        country: 'Indonesia',
        imageUrl: 'https://picsum.photos/seed/dest-ubud/600/700',
        tripCount: 7,
        description: 'Rice terraces, waterfall hikes, and golden-hour light made for photographers.',
    },
    {
        id: 'dest-6',
        name: 'Moab',
        country: 'USA',
        imageUrl: 'https://picsum.photos/seed/dest-moab/600/700',
        tripCount: 8,
        description: 'Red rock arches, canyon trails, and basecamp nights under wide desert skies.',
    },
];
