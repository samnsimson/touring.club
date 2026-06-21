import type { JoinConfig, Where } from 'better-auth/adapters';

export type FindOneArgs = {
    model: string;
    where: Where[];
    select?: string[];
    join?: JoinConfig;
};

export type FindManyArgs = {
    model: string;
    where?: Where[];
    limit?: number;
    select?: string[];
    offset?: number;
    sortBy?: { field: string; direction: 'asc' | 'desc' };
    join?: JoinConfig;
};

export type UpdateManyArgs = {
    model: string;
    where: Where[];
    update: Record<string, unknown>;
};

export type AdapterMethodHandles = {
    findOne: <T>(args: FindOneArgs) => Promise<T | null>;
    updateMany: (args: UpdateManyArgs) => Promise<number>;
};
