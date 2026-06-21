import { type MigrationInterface, type QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAccount1782029872234 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'accounts',
        columns: [
          {
            name: 'id',
            type: 'text',
            isPrimary: true,
          },
          {
            name: 'accountId',
            type: 'text',
            isNullable: false
          },
          {
            name: 'providerId',
            type: 'text',
            isNullable: false
          },
          {
            name: 'userId',
            type: 'text',
            isNullable: false
          },
          {
            name: 'accessToken',
            type: 'text',
            isNullable: true
          },
          {
            name: 'refreshToken',
            type: 'text',
            isNullable: true
          },
          {
            name: 'idToken',
            type: 'text',
            isNullable: true
          },
          {
            name: 'accessTokenExpiresAt',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'refreshTokenExpiresAt',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'scope',
            type: 'text',
            isNullable: true
          },
          {
            name: 'password',
            type: 'text',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            isNullable: false
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            isNullable: false
          }
        ],
      }),
    );

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('accounts');
  }
}
