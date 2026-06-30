import type { User } from './types';

export const mockUsers: User[] = [
    {
        id: 'user-1',
        username: 'ava.martinez',
        name: 'Ava Martinez',
        avatarUrl: 'https://i.pravatar.cc/150?img=47',
        bio: 'Trail runner and weekend road-tripper. Always chasing sunrise summits.',
        location: 'Denver, CO',
        interests: ['Hiking', 'Road Trip', 'National Parks'],
        joinedAt: '2024-02-11',
        tripsOrganizedCount: 4,
        tripsJoinedCount: 11,
    },
    {
        id: 'user-2',
        username: 'kenji.tanaka',
        name: 'Kenji Tanaka',
        avatarUrl: 'https://i.pravatar.cc/150?img=12',
        bio: 'Street photographer documenting food markets across Asia.',
        location: 'Osaka, Japan',
        interests: ['Photography', 'Food Tour'],
        joinedAt: '2023-11-03',
        tripsOrganizedCount: 7,
        tripsJoinedCount: 5,
    },
    {
        id: 'user-3',
        username: 'leila.haddad',
        name: 'Leila Haddad',
        avatarUrl: 'https://i.pravatar.cc/150?img=32',
        bio: 'Adventure guide. Desert treks, sea kayaking, and everything in between.',
        location: 'Marrakesh, Morocco',
        interests: ['Adventure Travel', 'Hiking'],
        joinedAt: '2023-08-22',
        tripsOrganizedCount: 12,
        tripsJoinedCount: 3,
    },
    {
        id: 'user-4',
        username: 'noah.becker',
        name: 'Noah Becker',
        avatarUrl: 'https://i.pravatar.cc/150?img=68',
        bio: 'National park completionist — 38 down, 25 to go.',
        location: 'Portland, OR',
        interests: ['National Parks', 'Photography'],
        joinedAt: '2024-05-09',
        tripsOrganizedCount: 2,
        tripsJoinedCount: 9,
    },
    {
        id: 'user-5',
        username: 'priya.nair',
        name: 'Priya Nair',
        avatarUrl: 'https://i.pravatar.cc/150?img=25',
        bio: 'Spice route explorer. I plan trips around what I want to eat.',
        location: 'Kochi, India',
        interests: ['Food Tour', 'Road Trip'],
        joinedAt: '2024-01-17',
        tripsOrganizedCount: 5,
        tripsJoinedCount: 6,
    },
    {
        id: 'user-6',
        username: 'oliver.svensson',
        name: 'Oliver Svensson',
        avatarUrl: 'https://i.pravatar.cc/150?img=15',
        bio: 'Fjord hopper and cold-water surfer.',
        location: 'Bergen, Norway',
        interests: ['Adventure Travel', 'Hiking', 'Photography'],
        joinedAt: '2023-06-30',
        tripsOrganizedCount: 9,
        tripsJoinedCount: 4,
    },
];

export const currentUser: User = mockUsers[0];

export function getUserById(id: string): User | undefined {
    return mockUsers.find((user) => user.id === id);
}

export function getUserByUsername(username: string): User | undefined {
    return mockUsers.find((user) => user.username === username);
}
