import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782070257330 implements MigrationInterface {
    name = 'Migration1782070257330';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "auth"."accounts" ("id" text NOT NULL, "account_id" text NOT NULL, "provider_id" text NOT NULL, "user_id" text NOT NULL, "access_token" text, "refresh_token" text, "id_token" text, "access_token_expires_at" TIMESTAMP, "refresh_token_expires_at" TIMESTAMP, "scope" text, "password" text, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "auth"."sessions" ("id" text NOT NULL, "expires_at" TIMESTAMP NOT NULL, "token" text NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "ip_address" text, "user_agent" text, "user_id" text NOT NULL, CONSTRAINT "UQ_e9f62f5dcb8a54b84234c9e7a06" UNIQUE ("token"), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "auth"."users" ("id" text NOT NULL, "name" text NOT NULL, "email" text NOT NULL, "email_verified" boolean NOT NULL, "image" text, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "auth"."verifications" ("id" text NOT NULL, "identifier" text NOT NULL, "value" text NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_2127ad1b143cf012280390b01d1" PRIMARY KEY ("id"))`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "auth"."verifications"`);
        await queryRunner.query(`DROP TABLE "auth"."users"`);
        await queryRunner.query(`DROP TABLE "auth"."sessions"`);
        await queryRunner.query(`DROP TABLE "auth"."accounts"`);
    }
}
