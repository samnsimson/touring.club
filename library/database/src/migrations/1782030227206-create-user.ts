import { type MigrationInterface, type QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUser1782030227206 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'text',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'text',
            isNullable: false
          },
          {
            name: 'email',
            type: 'text',
            isNullable: false,
            isUnique: true
          },
          {
            name: 'emailVerified',
            type: 'boolean',
            isNullable: false
          },
          {
            name: 'image',
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

    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'IDX_user_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user');
  }
}
