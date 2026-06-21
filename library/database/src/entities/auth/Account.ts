import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('accounts', { schema: 'auth' })
export class Account {
    @PrimaryColumn('text')
    id!: string;

    @Column('text', { name: 'account_id', nullable: false })
    accountId!: string;

    @Column('text', { name: 'provider_id', nullable: false })
    providerId!: string;

    @Column('text', { name: 'user_id', nullable: false })
    userId!: string;

    @Column('text', { name: 'access_token', nullable: true })
    accessToken!: string;

    @Column('text', { name: 'refresh_token', nullable: true })
    refreshToken!: string;

    @Column('text', { name: 'id_token', nullable: true })
    idToken!: string;

    @Column('timestamp', { name: 'access_token_expires_at', nullable: true })
    accessTokenExpiresAt!: Date;

    @Column('timestamp', { name: 'refresh_token_expires_at', nullable: true })
    refreshTokenExpiresAt!: Date;

    @Column('text', { nullable: true })
    scope!: string;

    @Column('text', { nullable: true })
    password!: string;

    @Column('timestamp', { name: 'created_at', nullable: false })
    createdAt!: Date;

    @Column('timestamp', { name: 'updated_at', nullable: false })
    updatedAt!: Date;
}
