import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLanguageFieldToUsers1739177955032 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN language VARCHAR(2) DEFAULT 'en' AFTER password;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN language;
    `);
    }

}
