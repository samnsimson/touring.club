import { type MigrationInterface, type QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateVerification1782555064316 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                schema: 'auth',
                name: 'verification',
                columns: [
                    {
                        name: 'id',
                        type: 'text',
                        isPrimary: true,
                    },
                    {
                        name: 'identifier',
                        type: 'text',
                    },
                    {
                        name: 'value',
                        type: 'text',
                    },
                    {
                        name: 'expires_at',
                        type: 'timestamptz',
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

        await queryRunner.createIndex(
            'verification',
            new TableIndex({
                name: 'verification_identifier_idx',
                columnNames: ['identifier'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(new Table({ schema: 'auth', name: 'verification' }));
    }
}
