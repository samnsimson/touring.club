import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateAccount1782555565393 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                schema: 'auth',
                name: 'account',
                columns: [
                    {
                        name: 'id',
                        type: 'text',
                        isPrimary: true,
                    },
                    {
                        name: 'account_id',
                        type: 'text',
                    },
                    {
                        name: 'provider_id',
                        type: 'text',
                    },
                    {
                        name: 'user_id',
                        type: 'text',
                    },
                    {
                        name: 'access_token',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'refresh_token',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'id_token',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'access_token_expires_at',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                    {
                        name: 'refresh_token_expires_at',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                    {
                        name: 'scope',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'password',
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
                    },
                ],
            }),
        );

        const accountTable = new Table({ schema: 'auth', name: 'account' });

        await queryRunner.createIndex(
            accountTable,
            new TableIndex({
                name: 'account_user_id_idx',
                columnNames: ['user_id'],
            }),
        );

        await queryRunner.createForeignKey(
            accountTable,
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'user',
                referencedSchema: 'auth',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(new Table({ schema: 'auth', name: 'account' }));
    }
}
