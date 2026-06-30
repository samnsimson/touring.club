export interface NavLink {
    label: string;
    href: string;
    authOnly?: boolean;
}

export const primaryNavLinks: NavLink[] = [
    { label: 'Discover Trips', href: '/trips' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Messages', href: '/messages', authOnly: true },
    { label: 'Dashboard', href: '/dashboard', authOnly: true },
];
