import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInspectionFieldsToWorkReport1746423741596 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`
            ALTER TABLE i_work_report
            ADD COLUMN inspection_date DATETIME NULL AFTER notes_measurements,
            ADD COLUMN next_date_exp DATETIME NULL AFTER inspection_date,
            ADD COLUMN insp_hours VARCHAR(100) NULL AFTER next_date_exp,
            ADD COLUMN next_hours_exp VARCHAR(100) NULL AFTER insp_hours,
            ADD COLUMN insp_cycles INT(10) NULL AFTER next_hours_exp,
            ADD COLUMN next_cycles_exp INT(10) NULL AFTER insp_cycles,
            ADD COLUMN work_report VARCHAR(255) nULL AFTER next_cycles_exp,
            ADD COLUMN inspection_requested_date DATETIME NULL AFTER work_report;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`
            ALTER TABLE i_work_report
            DROP COLUMN inspection_date,
            DROP COLUMN next_date_exp,
            DROP COLUMN insp_hours,
            DROP COLUMN next_hours_exp,
            DROP COLUMN insp_cycles,
            DROP COLUMN next_cycles_exp,
            DROP COLUMN work_report,
            DROP COLUMN inspection_requested_date;
        `);
    }

}
