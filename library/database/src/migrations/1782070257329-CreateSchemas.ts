import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchemas1782070257329 implements MigrationInterface {
    name = 'CreateSchemas1782070257329';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "auth"`);
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "general"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SCHEMA IF EXISTS "general" CASCADE`);
        await queryRunner.query(`DROP SCHEMA IF EXISTS "auth" CASCADE`);
    }
}
