'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { ReactNode } from 'react';
import { Provider as ChakraProvider } from '@tc/ui';

export function Providers({ children, session }: { children: ReactNode; session: Session | null }) {
    return (
        <SessionProvider session={session}>
            <ChakraProvider>{children}</ChakraProvider>
        </SessionProvider>
    );
}
