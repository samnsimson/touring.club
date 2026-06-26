import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ schema: 'auth', name: 'verification' })
export class Verification {
    @PrimaryColumn('text')
    id!: string;

    @Index('verification_identifier_idx')
    @Column('text', { name: 'identifier' })
    identifier!: string;

    @Column('text', { name: 'value' })
    value!: string;

    @Column('timestamptz', { name: 'expires_at' })
    expiresAt!: Date;

    @Column('timestamptz', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column('timestamptz', { name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;
}
