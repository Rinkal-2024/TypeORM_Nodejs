import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterFieldsToComponentEvaluationTable1747376718307 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE c_evaluation_histories
            ADD COLUMN exp_date DATETIME NULL AFTER motivation,
            ADD COLUMN exp_hours VARCHAR(100) NULL AFTER exp_date,
            ADD COLUMN exp_cycles INT NULL AFTER exp_hours,
            ADD COLUMN rem_days DATETIME NULL AFTER exp_cycles,
            ADD COLUMN rem_hours VARCHAR(100) NULL AFTER rem_days,
            ADD COLUMN rem_cycles INT NULL AFTER rem_hours;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE c_evaluation_histories
            DROP COLUMN rem_cycles,
            DROP COLUMN rem_hours,
            DROP COLUMN rem_days,
            DROP COLUMN exp_cycles,
            DROP COLUMN exp_hours,
            DROP COLUMN exp_date;
        `);
    }

}
