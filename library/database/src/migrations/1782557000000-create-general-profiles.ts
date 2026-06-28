import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';

export class CreateGeneralProfiles1782557000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE SCHEMA IF NOT EXISTS general');

        await queryRunner.createTable(
            new Table({
                schema: 'general',
                name: 'profiles',
                columns: [
                    {
                        name: 'user_id',
                        type: 'text',
                        isPrimary: true,
                    },
                    {
                        name: 'biography',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'interests',
                        type: 'text',
                        isArray: true,
                        default: "'{}'",
                    },
                    {
                        name: 'privacy_settings',
                        type: 'jsonb',
                        default: `'{"showEmail":false,"showTravelHistory":true}'`,
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
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(new Table({ schema: 'general', name: 'profiles' }));
    }
}
