import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterFieldsTocomponentsEvaluationTable1747721365393 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE c_evaluation_histories
            MODIFY COLUMN rem_days INT(11) NULL;
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE c_evaluation_histories
            MODIFY COLUMN rem_days INT(11) NOT NULL;
          `);
    }

}
