import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';

export class CreateJwks1782555565395 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                schema: 'auth',
                name: 'jwks',
                columns: [
                    {
                        name: 'id',
                        type: 'text',
                        isPrimary: true,
                    },
                    {
                        name: 'public_key',
                        type: 'text',
                    },
                    {
                        name: 'private_key',
                        type: 'text',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamptz',
                    },
                    {
                        name: 'expires_at',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(new Table({ schema: 'auth', name: 'jwks' }));
    }
}
