import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToOrganizationsTable1745829248437 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.query(`
        ALTER TABLE organizations
        ADD COLUMN name VARCHAR(255) NULL AFTER organizationId,
        ADD COLUMN street VARCHAR(255) NULL AFTER name,
        ADD COLUMN city VARCHAR(255) NULL AFTER street,
        ADD COLUMN postlCode VARCHAR(255) NULL AFTER city,
        ADD COLUMN countryId INT NULL AFTER postlCode,
        ADD COLUMN email VARCHAR(255) NULL AFTER countryId,
        ADD COLUMN phone VARCHAR(255) NULL AFTER email;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
          await queryRunner.query(`
        ALTER TABLE organizations
        DROP COLUMN name,
        DROP COLUMN street,
        DROP COLUMN city,
        DROP COLUMN postlCode,
        DROP COLUMN countryId,
        DROP COLUMN email,
        DROP COLUMN phone;
    `);
    }

}
