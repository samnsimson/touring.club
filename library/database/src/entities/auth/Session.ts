import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sessions', { schema: 'auth' })
export class Session {
    @PrimaryColumn('text')
    id!: string;

    @Column('timestamp', { name: 'expires_at', nullable: false })
    expiresAt!: Date;

    @Column('text', { nullable: false, unique: true })
    token!: string;

    @Column('timestamp', { name: 'created_at', nullable: false })
    createdAt!: Date;

    @Column('timestamp', { name: 'updated_at', nullable: false })
    updatedAt!: Date;

    @Column('text', { name: 'ip_address', nullable: true })
    ipAddress!: string;

    @Column('text', { name: 'user_agent', nullable: true })
    userAgent!: string;

    @Column('text', { name: 'user_id', nullable: false })
    userId!: string;

    @Column('text', { name: 'impersonated_by', nullable: true })
    impersonatedBy!: string;
}
