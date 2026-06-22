import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782071544657 implements MigrationInterface {
    name = 'Migration1782071544657';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "auth"."jwkss" ("id" text NOT NULL, "public_key" text NOT NULL, "private_key" text NOT NULL, "created_at" TIMESTAMP NOT NULL, "expires_at" TIMESTAMP, CONSTRAINT "PK_153da44a5aa0de1f20b9825a7b6" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(`ALTER TABLE "auth"."sessions" ADD "impersonated_by" text`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ADD "role" text`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ADD "banned" boolean`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ADD "ban_reason" text`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ADD "ban_expires" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ADD "username" text`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ADD "display_username" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth"."users" DROP COLUMN "display_username"`);
        await queryRunner.query(`ALTER TABLE "auth"."users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
        await queryRunner.query(`ALTER TABLE "auth"."users" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "auth"."users" DROP COLUMN "ban_expires"`);
        await queryRunner.query(`ALTER TABLE "auth"."users" DROP COLUMN "ban_reason"`);
        await queryRunner.query(`ALTER TABLE "auth"."users" DROP COLUMN "banned"`);
        await queryRunner.query(`ALTER TABLE "auth"."users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "auth"."sessions" DROP COLUMN "impersonated_by"`);
        await queryRunner.query(`DROP TABLE "auth"."jwkss"`);
    }
}
