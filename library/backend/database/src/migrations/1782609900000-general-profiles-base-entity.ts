import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class GeneralProfilesBaseEntity1782609900000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general"."profiles" ADD COLUMN "id" uuid NOT NULL DEFAULT gen_random_uuid()`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" ADD COLUMN "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" DROP CONSTRAINT "PK_9e432b7df0d182f8d292902d1a2"`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" ADD CONSTRAINT "PK_9e432b7df0d182f8d292902d1a2" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" ADD CONSTRAINT "UQ_profiles_user_id" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" ALTER COLUMN "id" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general"."profiles" DROP CONSTRAINT "UQ_profiles_user_id"`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" DROP CONSTRAINT "PK_9e432b7df0d182f8d292902d1a2"`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" ADD CONSTRAINT "PK_9e432b7df0d182f8d292902d1a2" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" DROP COLUMN "id"`);
    }
}
