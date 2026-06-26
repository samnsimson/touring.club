import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity({ schema: 'auth', name: 'session' })
export class Session {
    @PrimaryColumn('text')
    id!: string;

    @Column('timestamptz', { name: 'expires_at' })
    expiresAt!: Date;

    @Column('text', { name: 'token', unique: true })
    token!: string;

    @Column('timestamptz', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column('timestamptz', { name: 'updated_at' })
    updatedAt!: Date;

    @Column('text', { name: 'ip_address', nullable: true })
    ipAddress: string | null;

    @Column('text', { name: 'user_agent', nullable: true })
    userAgent: string | null;

    @Index('session_user_id_idx')
    @Column('text', { name: 'user_id' })
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user!: User;

    @Column('text', { name: 'impersonated_by', nullable: true })
    impersonatedBy: string | null;
}
