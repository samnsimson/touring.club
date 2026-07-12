import './global.css';
import type { ReactNode } from 'react';
import { Footer } from '@tc/ui';
import { auth } from '@/auth';
import { Providers } from './providers';
import { AppNavbar } from '@/components/shell/app-navbar';

export const metadata = {
    title: 'touring.club — Discover group trips and travel communities',
    description: 'Discover, organize, and join group trips, local experiences, and community-driven travel events.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers session={session}>
                    <AppNavbar />
                    {children}
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
