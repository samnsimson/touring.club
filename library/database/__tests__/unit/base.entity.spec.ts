import { getMetadataArgsStorage } from 'typeorm';
import { BaseEntity } from '../../src/lib/base.entity';

describe('BaseEntity', () => {
    it('registers shared column metadata on the base class', () => {
        const propertyNames = getMetadataArgsStorage()
            .columns.filter((column) => column.target === BaseEntity)
            .map((column) => column.propertyName)
            .sort();
        expect(propertyNames).toEqual(['createdAt', 'deletedAt', 'id', 'updatedAt']);
    });

    it('registers uuid generation for id', () => {
        const generation = getMetadataArgsStorage().generations.find((entry) => entry.target === BaseEntity && entry.propertyName === 'id');
        expect(generation?.strategy).toBe('uuid');
    });
});
