import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryColumn('text')
  id!: string;

  @Column('timestamp', { name: 'expiresAt', nullable: false })
  expiresAt!: Date;

  @Column('text', { name: 'token', nullable: false, unique: true })
  token!: string;

  @Column('timestamp', { name: 'createdAt', nullable: false })
  createdAt!: Date;

  @Column('timestamp', { name: 'updatedAt', nullable: false })
  updatedAt!: Date;

  @Column('text', { name: 'ipAddress', nullable: true })
  ipAddress!: string;

  @Column('text', { name: 'userAgent', nullable: true })
  userAgent!: string;

  @Column('text', { name: 'userId', nullable: false })
  userId!: string;

}
