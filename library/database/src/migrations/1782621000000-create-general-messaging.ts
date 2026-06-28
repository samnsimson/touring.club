import { type MigrationInterface, type QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateGeneralMessaging1782621000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE SCHEMA IF NOT EXISTS general');

        await queryRunner.createTable(
            new Table({
                schema: 'general',
                name: 'conversations',
                columns: [
                    { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
                    { name: 'type', type: 'text' },
                    { name: 'trip_id', type: 'uuid', isNullable: true },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        );

        await queryRunner.createTable(
            new Table({
                schema: 'general',
                name: 'conversation_participants',
                columns: [
                    { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
                    { name: 'conversation_id', type: 'uuid' },
                    { name: 'user_id', type: 'text' },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        );

        await queryRunner.createTable(
            new Table({
                schema: 'general',
                name: 'messages',
                columns: [
                    { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
                    { name: 'conversation_id', type: 'uuid' },
                    { name: 'sender_id', type: 'text' },
                    { name: 'message_type', type: 'text', default: "'text'" },
                    { name: 'body', type: 'text' },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        );

        await queryRunner.createIndex(
            'general.conversation_participants',
            new TableIndex({ name: 'IDX_conversation_participants_conversation_id', columnNames: ['conversation_id'] }),
        );
        await queryRunner.createIndex(
            'general.conversation_participants',
            new TableIndex({ name: 'IDX_conversation_participants_user_id', columnNames: ['user_id'] }),
        );
        await queryRunner.createIndex(
            'general.conversation_participants',
            new TableIndex({ name: 'UQ_conversation_participants_conversation_user', columnNames: ['conversation_id', 'user_id'], isUnique: true }),
        );
        await queryRunner.createIndex('general.messages', new TableIndex({ name: 'IDX_messages_conversation_id', columnNames: ['conversation_id'] }));
        await queryRunner.createIndex('general.messages', new TableIndex({ name: 'IDX_messages_sender_id', columnNames: ['sender_id'] }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(new Table({ schema: 'general', name: 'messages' }));
        await queryRunner.dropTable(new Table({ schema: 'general', name: 'conversation_participants' }));
        await queryRunner.dropTable(new Table({ schema: 'general', name: 'conversations' }));
    }
}
