import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';

export class CreateGeneralTrips1782614000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE SCHEMA IF NOT EXISTS general');

        await queryRunner.createTable(
            new Table({
                schema: 'general',
                name: 'trips',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'organizer_id',
                        type: 'text',
                    },
                    {
                        name: 'title',
                        type: 'text',
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'destination',
                        type: 'text',
                    },
                    {
                        name: 'meeting_location',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'start_date',
                        type: 'timestamptz',
                    },
                    {
                        name: 'end_date',
                        type: 'timestamptz',
                    },
                    {
                        name: 'capacity',
                        type: 'int',
                    },
                    {
                        name: 'visibility',
                        type: 'text',
                        default: "'private'",
                    },
                    {
                        name: 'status',
                        type: 'text',
                        default: "'draft'",
                    },
                    {
                        name: 'cover_image_urls',
                        type: 'text',
                        isArray: true,
                        default: "'{}'",
                    },
                    {
                        name: 'categories',
                        type: 'text',
                        isArray: true,
                        default: "'{}'",
                    },
                    {
                        name: 'tags',
                        type: 'text',
                        isArray: true,
                        default: "'{}'",
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

        await queryRunner.query(`CREATE INDEX "IDX_trips_organizer_id" ON "general"."trips" ("organizer_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(new Table({ schema: 'general', name: 'trips' }));
    }
}
