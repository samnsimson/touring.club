import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782609873407 implements MigrationInterface {
    name = 'Migration1782609873407';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth"."accounts" DROP CONSTRAINT "FK_efef1e5fdbe318a379c06678c51"`);
        await queryRunner.query(`ALTER TABLE "auth"."sessions" DROP CONSTRAINT "FK_30e98e8746699fb9af235410aff"`);
        await queryRunner.query(`DROP INDEX "auth"."account_user_id_idx"`);
        await queryRunner.query(`DROP INDEX "auth"."session_user_id_idx"`);
        await queryRunner.query(`DROP INDEX "auth"."verification_identifier_idx"`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auth"."sessions" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auth"."verifications" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auth"."verifications" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" ALTER COLUMN "privacy_settings" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "accounts_user_id_idx" ON "auth"."accounts"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "verifications_identifier_idx" ON "auth"."verifications"  ("identifier") `);
        await queryRunner.query(
            `ALTER TABLE "auth"."accounts" ADD CONSTRAINT "FK_3000dad1da61b29953f07476324" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "auth"."sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth"."sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" DROP CONSTRAINT "FK_3000dad1da61b29953f07476324"`);
        await queryRunner.query(`DROP INDEX "auth"."verifications_identifier_idx"`);
        await queryRunner.query(`DROP INDEX "auth"."sessions_user_id_idx"`);
        await queryRunner.query(`DROP INDEX "auth"."accounts_user_id_idx"`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "general"."profiles" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(
            `ALTER TABLE "general"."profiles" ALTER COLUMN "privacy_settings" SET DEFAULT '{"showEmail": false, "showTravelHistory": true}'`,
        );
        await queryRunner.query(`ALTER TABLE "auth"."verifications" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "auth"."verifications" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "auth"."sessions" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`CREATE INDEX "verification_identifier_idx" ON "auth"."verifications" USING btree ("identifier") `);
        await queryRunner.query(`CREATE INDEX "session_user_id_idx" ON "auth"."sessions" USING btree ("user_id") `);
        await queryRunner.query(`CREATE INDEX "account_user_id_idx" ON "auth"."accounts" USING btree ("user_id") `);
        await queryRunner.query(
            `ALTER TABLE "auth"."sessions" ADD CONSTRAINT "FK_30e98e8746699fb9af235410aff" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "auth"."accounts" ADD CONSTRAINT "FK_efef1e5fdbe318a379c06678c51" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }
}
