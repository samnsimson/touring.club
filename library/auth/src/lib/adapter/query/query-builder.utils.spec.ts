import { SnakeNamingStrategy } from 'typeorm';
import { createNamingAwareContext } from '../core/naming-context';
import type { AdapterContext } from '../core/adapter.context';
import { buildSelectColumns, mapFieldsToColumns, mapRowToFields } from './query-builder.utils';

const baseContext: AdapterContext = {
    schema: {
        user: {
            fields: {
                emailVerified: { type: 'boolean' },
                createdAt: { type: 'date' },
            },
        },
    },
    getDefaultModelName: (model) => model,
    getModelName: (model) => model,
    getFieldName: ({ field }) => field,
    getFieldAttributes: () => ({}),
};

describe('query-builder naming helpers', () => {
    const context = createNamingAwareContext(baseContext, new SnakeNamingStrategy());

    it('maps logical fields to snake_case columns', () => {
        expect(mapFieldsToColumns(context, 'user', { emailVerified: true, createdAt: '2024-01-01' })).toEqual({
            email_verified: true,
            created_at: '2024-01-01',
        });
    });

    it('maps snake_case rows back to logical fields', () => {
        expect(
            mapRowToFields(context, 'user', {
                id: '1',
                email_verified: true,
                created_at: '2024-01-01',
            }),
        ).toEqual({
            id: '1',
            emailVerified: true,
            createdAt: '2024-01-01',
        });
    });

    it('builds select columns with snake_case refs and physical aliases', () => {
        expect(buildSelectColumns('base', 'user', ['emailVerified'], context)).toEqual(['base.email_verified AS "email_verified"']);
    });
});
