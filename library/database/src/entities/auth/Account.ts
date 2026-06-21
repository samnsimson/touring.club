import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('accounts', { schema: 'auth' })
export class Account {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { name: 'accountId', nullable: false })
  accountId!: string;

  @Column('text', { name: 'providerId', nullable: false })
  providerId!: string;

  @Column('text', { name: 'userId', nullable: false })
  userId!: string;

  @Column('text', { name: 'accessToken', nullable: true })
  accessToken!: string;

  @Column('text', { name: 'refreshToken', nullable: true })
  refreshToken!: string;

  @Column('text', { name: 'idToken', nullable: true })
  idToken!: string;

  @Column('timestamp', { name: 'accessTokenExpiresAt', nullable: true })
  accessTokenExpiresAt!: Date;

  @Column('timestamp', { name: 'refreshTokenExpiresAt', nullable: true })
  refreshTokenExpiresAt!: Date;

  @Column('text', { name: 'scope', nullable: true })
  scope!: string;

  @Column('text', { name: 'password', nullable: true })
  password!: string;

  @Column('timestamp', { name: 'createdAt', nullable: false })
  createdAt!: Date;

  @Column('timestamp', { name: 'updatedAt', nullable: false })
  updatedAt!: Date;

}
