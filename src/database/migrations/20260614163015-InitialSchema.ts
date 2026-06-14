import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema20260614163015 implements MigrationInterface {
  name = 'InitialSchema20260614163015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"                 SERIAL PRIMARY KEY,
        "telegram_id"        VARCHAR NOT NULL UNIQUE,
        "username"           VARCHAR,
        "first_name"         VARCHAR,
        "last_name"          VARCHAR,
        "coins"              BIGINT NOT NULL DEFAULT 0,
        "energy"             INTEGER NOT NULL DEFAULT 500,
        "max_energy"         INTEGER NOT NULL DEFAULT 500,
        "tap_power"          INTEGER NOT NULL DEFAULT 1,
        "energy_regen_rate"  INTEGER NOT NULL DEFAULT 1,
        "last_energy_update" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "created_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_users_telegram_id" ON "users" ("telegram_id")`);

    await queryRunner.query(`
      CREATE TABLE "user_upgrades" (
        "id"           SERIAL PRIMARY KEY,
        "user_id"      INTEGER NOT NULL,
        "upgrade_type" VARCHAR NOT NULL,
        "level"        INTEGER NOT NULL DEFAULT 1,
        "purchased_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_user_upgrades_user_type" UNIQUE ("user_id", "upgrade_type"),
        CONSTRAINT "FK_user_upgrades_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_user_upgrades_user_id" ON "user_upgrades" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_user_upgrades_user_id"`);
    await queryRunner.query(`DROP TABLE "user_upgrades"`);
    await queryRunner.query(`DROP INDEX "IDX_users_telegram_id"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
