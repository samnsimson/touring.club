import { type MigrationInterface, type QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSession1782030227206 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'session',
        columns: [
          {
            name: 'id',
            type: 'text',
            isPrimary: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: false
          },
          {
            name: 'token',
            type: 'text',
            isNullable: false,
            isUnique: true
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
          },
          {
            name: 'ipAddress',
            type: 'text',
            isNullable: true
          },
          {
            name: 'userAgent',
            type: 'text',
            isNullable: true
          },
          {
            name: 'userId',
            type: 'text',
            isNullable: false
          }
        ],
      }),
    );

    await queryRunner.createIndex(
      'session',
      new TableIndex({
        name: 'IDX_session_token',
        columnNames: ['token'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('session');
  }
}
