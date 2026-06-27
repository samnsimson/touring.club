import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity({ schema: 'auth', name: 'accounts' })
export class Account {
    @PrimaryColumn('text')
    id!: string;

    @Column('text', { name: 'account_id' })
    accountId!: string;

    @Column('text', { name: 'provider_id' })
    providerId!: string;

    @Index('accounts_user_id_idx')
    @Column('text', { name: 'user_id' })
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user!: User;

    @Column('text', { name: 'access_token', nullable: true })
    accessToken: string | null;

    @Column('text', { name: 'refresh_token', nullable: true })
    refreshToken: string | null;

    @Column('text', { name: 'id_token', nullable: true })
    idToken: string | null;

    @Column('timestamptz', { name: 'access_token_expires_at', nullable: true })
    accessTokenExpiresAt: Date | null;

    @Column('timestamptz', { name: 'refresh_token_expires_at', nullable: true })
    refreshTokenExpiresAt: Date | null;

    @Column('text', { name: 'scope', nullable: true })
    scope: string | null;

    @Column('text', { name: 'password', nullable: true })
    password: string | null;

    @Column('timestamptz', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column('timestamptz', { name: 'updated_at' })
    updatedAt!: Date;
}
