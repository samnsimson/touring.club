import { type MigrationInterface, type QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateGeneralTripMemberships1782620000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE SCHEMA IF NOT EXISTS general');

        await queryRunner.createTable(
            new Table({
                schema: 'general',
                name: 'trip_memberships',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'trip_id',
                        type: 'uuid',
                    },
                    {
                        name: 'user_id',
                        type: 'text',
                    },
                    {
                        name: 'status',
                        type: 'text',
                        default: "'pending'",
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
                        name: 'deleted_at',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                ],
            }),
        );

        await queryRunner.createIndex(
            'general.trip_memberships',
            new TableIndex({
                name: 'IDX_trip_memberships_trip_id',
                columnNames: ['trip_id'],
            }),
        );

        await queryRunner.createIndex(
            'general.trip_memberships',
            new TableIndex({
                name: 'IDX_trip_memberships_user_id',
                columnNames: ['user_id'],
            }),
        );

        await queryRunner.createIndex(
            'general.trip_memberships',
            new TableIndex({
                name: 'UQ_trip_memberships_trip_user',
                columnNames: ['trip_id', 'user_id'],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(new Table({ schema: 'general', name: 'trip_memberships' }));
    }
}
