import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('verifications', { schema: 'auth' })
export class Verification {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { name: 'identifier', nullable: false })
  identifier!: string;

  @Column('text', { name: 'value', nullable: false })
  value!: string;

  @Column('timestamp', { name: 'expiresAt', nullable: false })
  expiresAt!: Date;

  @Column('timestamp', { name: 'createdAt', nullable: false })
  createdAt!: Date;

  @Column('timestamp', { name: 'updatedAt', nullable: false })
  updatedAt!: Date;

}
