import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddProfileAvatarUrl1782612000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general"."profiles" ADD COLUMN "avatar_url" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general"."profiles" DROP COLUMN "avatar_url"`);
    }
}
