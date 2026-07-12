import type { ReactNode } from 'react';
import { DashboardShell } from '@tc/ui';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return <DashboardShell>{children}</DashboardShell>;
}
