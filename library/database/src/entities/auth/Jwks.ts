import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('jwkss', { schema: 'auth' })
export class Jwks {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { name: 'public_key', nullable: false })
  publicKey!: string;

  @Column('text', { name: 'private_key', nullable: false })
  privateKey!: string;

  @Column('timestamp', { name: 'created_at', nullable: false })
  createdAt!: Date;

  @Column('timestamp', { name: 'expires_at', nullable: true })
  expiresAt!: Date;

}
