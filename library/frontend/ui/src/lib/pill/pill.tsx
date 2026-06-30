import { Badge } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface PillProps {
    children: ReactNode;
    colorPalette?: string;
    variant?: 'solid' | 'subtle' | 'outline' | 'surface';
}

export function Pill({ children, colorPalette = 'orange', variant = 'subtle' }: PillProps) {
    return (
        <Badge colorPalette={colorPalette} variant={variant} borderRadius="full" px="3" py="1" fontWeight="medium">
            {children}
        </Badge>
    );
}

const TRIP_STATUS_COLORS: Record<string, string> = {
    draft: 'gray',
    published: 'green',
    cancelled: 'red',
    archived: 'gray',
};

export function TripStatusPill({ status }: { status: string }) {
    return <Pill colorPalette={TRIP_STATUS_COLORS[status] ?? 'gray'}>{status}</Pill>;
}

const DIFFICULTY_COLORS: Record<string, string> = {
    easy: 'green',
    moderate: 'orange',
    challenging: 'red',
};

export function DifficultyPill({ difficulty }: { difficulty: string }) {
    return <Pill colorPalette={DIFFICULTY_COLORS[difficulty] ?? 'gray'}>{difficulty}</Pill>;
}

export function CategoryPill({ category }: { category: string }) {
    return (
        <Pill colorPalette="teal" variant="surface">
            {category}
        </Pill>
    );
}
