import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToInspection1746429290298 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`
            ALTER TABLE inspections
            ADD COLUMN i_status VARCHAR(100) NULL AFTER cycle_type,
            ADD COLUMN work_report VARCHAR(255) AFTER motivation;
         `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`
            ALTER TABLE inspections
            DROP COLUMN i_status,
            DROP COLUMN work_report;
        `);
    }

}
