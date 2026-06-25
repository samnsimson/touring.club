import { describe, expect, it } from 'vitest';
import { formatGeneratedSource } from '../schema/format-generated-source.js';

describe('formatGeneratedSource', () => {
    it('formats generated entity source using project prettier config', async () => {
        const source = `import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users', { schema: 'auth' })
export class User {
  @PrimaryColumn('text')
  id!: string;
}
`;

        const formatted = await formatGeneratedSource(source, 'library/database/src/entities/auth/User.ts');

        expect(formatted).toMatch(/\n {4}@PrimaryColumn\('text'\)/);
    });
});
