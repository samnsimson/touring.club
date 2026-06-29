import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782619070513 implements MigrationInterface {
    name = 'Migration1782619070513';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "general"."IDX_trips_organizer_id"`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "general"."trips" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "general"."trips" ALTER COLUMN "updated_at" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "general"."trips" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "general"."trips" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`CREATE INDEX "IDX_trips_organizer_id" ON "general"."trips" USING btree ("organizer_id") `);
    }
}
