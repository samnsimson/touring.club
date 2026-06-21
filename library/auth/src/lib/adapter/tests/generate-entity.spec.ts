import { SnakeNamingStrategy } from '@tc/utils';
import type { DBFieldAttribute } from 'better-auth/db';
import { describe, expect, it } from 'vitest';
import { generateEntitySource } from '../schema/generate-entity.js';

describe('generateEntitySource', () => {
    const table: { modelName: string; fields: Record<string, DBFieldAttribute> } = {
        modelName: 'users',
        fields: {
            id: { type: 'string', required: true },
            emailVerified: { type: 'boolean', required: true },
            createdAt: { type: 'date', required: true },
        },
    };

    it('applies namingStrategy to table and column names', () => {
        const source = generateEntitySource('user', table, 'postgres', {
            schema: 'auth',
            namingStrategy: new SnakeNamingStrategy(),
        });

        expect(source).toContain("@Entity('users', { schema: 'auth' })");
        expect(source).toContain("name: 'email_verified'");
        expect(source).toContain("name: 'created_at'");
        expect(source).toContain('emailVerified!: boolean');
    });
});
