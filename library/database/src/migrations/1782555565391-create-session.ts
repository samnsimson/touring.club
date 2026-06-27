import { type MigrationInterface, type QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateSession1782555565391 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                schema: 'auth',
                name: 'session',
                columns: [
                    {
                        name: 'id',
                        type: 'text',
                        isPrimary: true,
                    },
                    {
                        name: 'expires_at',
                        type: 'timestamptz',
                    },
                    {
                        name: 'token',
                        type: 'text',
                        isUnique: true,
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
                    {
                        name: 'ip_address',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'user_agent',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'user_id',
                        type: 'text',
                    },
                    {
                        name: 'impersonated_by',
                        type: 'text',
                        isNullable: true,
                    },
                ],
            }),
        );

        await queryRunner.createIndex(
            'session',
            new TableIndex({
                name: 'session_user_id_idx',
                columnNames: ['user_id'],
            }),
        );

        await queryRunner.createForeignKey(
            'session',
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
        await queryRunner.dropTable(new Table({ schema: 'auth', name: 'session' }));
    }
}
