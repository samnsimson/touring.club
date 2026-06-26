import { type MigrationInterface, type QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class CreateUser1782432322553 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                schema: 'auth',
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
                    },
                    {
                        name: 'email',
                        type: 'text',
                        isUnique: true,
                    },
                    {
                        name: 'email_verified',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'image',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'role',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'banned',
                        type: 'boolean',
                        isNullable: true,
                        default: false,
                    },
                    {
                        name: 'ban_reason',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'ban_expires',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                    {
                        name: 'username',
                        type: 'text',
                        isNullable: true,
                        isUnique: true,
                    },
                    {
                        name: 'display_username',
                        type: 'text',
                        isNullable: true,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(new Table({ schema: 'auth', name: 'user' }));
    }
}
