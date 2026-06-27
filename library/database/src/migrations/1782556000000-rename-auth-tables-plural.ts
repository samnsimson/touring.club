import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameAuthTablesPlural1782556000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE auth."user" RENAME TO users');
        await queryRunner.query('ALTER TABLE auth.session RENAME TO sessions');
        await queryRunner.query('ALTER TABLE auth.account RENAME TO accounts');
        await queryRunner.query('ALTER TABLE auth.verification RENAME TO verifications');
        await queryRunner.query('ALTER TABLE auth.jwks RENAME TO jwkss');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE auth.jwkss RENAME TO jwks');
        await queryRunner.query('ALTER TABLE auth.verifications RENAME TO verification');
        await queryRunner.query('ALTER TABLE auth.accounts RENAME TO account');
        await queryRunner.query('ALTER TABLE auth.sessions RENAME TO session');
        await queryRunner.query('ALTER TABLE auth.users RENAME TO "user"');
    }
}
