import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ schema: 'auth', name: 'users' })
export class User {
    @PrimaryColumn('text')
    id!: string;

    @Column('text', { name: 'name' })
    name!: string;

    @Column('text', { name: 'email', unique: true })
    email!: string;

    @Column('boolean', { name: 'email_verified', default: false })
    emailVerified!: boolean;

    @Column('text', { name: 'image', nullable: true })
    image: string | null;

    @Column('timestamptz', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column('timestamptz', { name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;

    @Column('text', { name: 'role', nullable: true })
    role: string | null;

    @Column('boolean', { name: 'banned', nullable: true, default: false })
    banned: boolean | null;

    @Column('text', { name: 'ban_reason', nullable: true })
    banReason: string | null;

    @Column('timestamptz', { name: 'ban_expires', nullable: true })
    banExpires: Date | null;

    @Column('text', { name: 'username', nullable: true, unique: true })
    username: string | null;

    @Column('text', { name: 'display_username', nullable: true })
    displayUsername: string | null;
}
