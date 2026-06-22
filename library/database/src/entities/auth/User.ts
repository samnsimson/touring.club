import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users', { schema: 'auth' })
export class User {
    @PrimaryColumn('text')
    id!: string;

    @Column('text', { nullable: false })
    name!: string;

    @Column('text', { nullable: false, unique: true })
    email!: string;

    @Column('boolean', { name: 'email_verified', nullable: false })
    emailVerified!: boolean;

    @Column('text', { nullable: true })
    image!: string;

    @Column('timestamp', { name: 'created_at', nullable: false })
    createdAt!: Date;

    @Column('timestamp', { name: 'updated_at', nullable: false })
    updatedAt!: Date;

    @Column('text', { nullable: true })
    role!: string;

    @Column('boolean', { nullable: true })
    banned!: boolean;

    @Column('text', { name: 'ban_reason', nullable: true })
    banReason!: string;

    @Column('timestamp', { name: 'ban_expires', nullable: true })
    banExpires!: Date;

    @Column('text', { nullable: true, unique: true })
    username!: string;

    @Column('text', { name: 'display_username', nullable: true })
    displayUsername!: string;
}
