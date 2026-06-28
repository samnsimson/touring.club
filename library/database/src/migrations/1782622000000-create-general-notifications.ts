import { type MigrationInterface, type QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateGeneralNotifications1782622000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE SCHEMA IF NOT EXISTS general');

        await queryRunner.createTable(
            new Table({
                schema: 'general',
                name: 'notifications',
                columns: [
                    { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
                    { name: 'user_id', type: 'text' },
                    { name: 'type', type: 'text' },
                    { name: 'title', type: 'text' },
                    { name: 'body', type: 'text', isNullable: true },
                    { name: 'read_at', type: 'timestamptz', isNullable: true },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        );

        await queryRunner.createIndex('general.notifications', new TableIndex({ name: 'IDX_notifications_user_id', columnNames: ['user_id'] }));
        await queryRunner.createIndex(
            'general.notifications',
            new TableIndex({ name: 'IDX_notifications_user_id_read_at', columnNames: ['user_id', 'read_at'] }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(new Table({ schema: 'general', name: 'notifications' }));
    }
}
