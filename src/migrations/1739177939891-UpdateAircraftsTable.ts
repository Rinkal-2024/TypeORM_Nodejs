import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAircraftsTable1739177939891 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE aircrafts
          CHANGE COLUMN engine1_hours engine1_hours VARCHAR(100) COLLATE 'utf8mb4_general_ci' NULL AFTER airframe_cycles,
          CHANGE COLUMN engine1_n1 engine1_n1 INT(10) NULL AFTER engine1_hours,
          CHANGE COLUMN engine1_n2 engine1_n2 INT(10) NULL AFTER engine1_n1,
          CHANGE COLUMN engine1_imp engine1_imp INT(10) NULL AFTER engine1_n2;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE aircrafts
          CHANGE COLUMN engine1_hours engine1_hours INT(10) NULL,
          CHANGE COLUMN engine1_n1 engine1_n1 INT(10) NULL,
          CHANGE COLUMN engine1_n2 engine1_n2 INT(10) NULL,
          CHANGE COLUMN engine1_imp engine1_imp INT(10) NULL;
        `);
    }

}
