import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('verifications', { schema: 'auth' })
export class Verification {
    @PrimaryColumn('text')
    id!: string;

    @Column('text', { nullable: false })
    identifier!: string;

    @Column('text', { nullable: false })
    value!: string;

    @Column('timestamp', { name: 'expires_at', nullable: false })
    expiresAt!: Date;

    @Column('timestamp', { name: 'created_at', nullable: false })
    createdAt!: Date;

    @Column('timestamp', { name: 'updated_at', nullable: false })
    updatedAt!: Date;
}
