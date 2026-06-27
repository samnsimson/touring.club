import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ schema: 'auth', name: 'jwks' })
export class Jwks {
    @PrimaryColumn('text')
    id!: string;

    @Column('text', { name: 'public_key' })
    publicKey!: string;

    @Column('text', { name: 'private_key' })
    privateKey!: string;

    @Column('timestamptz', { name: 'created_at' })
    createdAt!: Date;

    @Column('timestamptz', { name: 'expires_at', nullable: true })
    expiresAt: Date | null;
}
