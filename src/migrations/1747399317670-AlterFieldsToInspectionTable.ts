import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterFieldsToInspectionTable1747399317670 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE inspections
            ADD COLUMN exp_date_close DATETIME NULL AFTER work_report,
            ADD COLUMN exp_hours_close VARCHAR(100) NULL AFTER exp_date_close,
            ADD COLUMN exp_cycles_close INT NULL AFTER exp_hours_close
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE inspections
            DROP COLUMN exp_date_close,
            DROP COLUMN exp_hours_close,
            DROP COLUMN exp_cycles_close,
        `);
    }

}