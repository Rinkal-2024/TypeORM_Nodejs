import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInspectionEvaluationTable1741852578426 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
     CREATE TABLE  i_evaluation_histories (
    id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
    user_id INT(11) NOT NULL,
    inspection_id INT(11) NOT NULL,
    aircraftId INT(11) NOT NULL,
    wr_no varchar(50)NOT NULL,
    aircraft_type VARCHAR(255) NULL,
    revision VARCHAR(255) NULL,
    revision_date DATETIME NULL,
    atachapter TEXT NULL,
    chapter_section_subject TEXT NULL,
    ata_title VARCHAR(255) NULL,
    task_number VARCHAR(255) NULL,
    task_title VARCHAR(255) NULL,
    modes VARCHAR(255) NULL,
    climatic_condition TEXT NULL,
    description TEXT NULL,
    mpn VARCHAR(255) NULL,
    pn VARCHAR(255) NULL,
    maintenance_mode VARCHAR(255) NULL,
    frequency TEXT NULL,
    limit_1 VARCHAR(255) NULL,
    unit_1 VARCHAR(255) NULL,
    margin_1 VARCHAR(255) NULL,
    margin_unit_1 VARCHAR(255) NULL,
    limit_2 VARCHAR(255) NULL,
    unit_2 VARCHAR(255) NULL,
    margin_2 VARCHAR(255) NULL,
    margin_unit_2 VARCHAR(255) NULL,
    limit_3 VARCHAR(255) NULL,
    unit_3 VARCHAR(255) NULL,
    margin_3 VARCHAR(255) NULL,
    margin_unit_3 VARCHAR(255) NULL,
    ref_manual TEXT NULL,
    documentation TEXT NULL,
    cycle_type VARCHAR(255) NULL,
    i_key VARCHAR(255) NULL,
    applicable enum('Yes','No') NULL,
    motivation text NULL,
    inspection_date DATETIME NULL,
    next_date_exp DATETIME NULL,
    insp_hours varchar(100) NULL,
    next_hours_exp	varchar(100) NULL,
    insp_cycles int (10) NULL,
    next_cycles_exp int (10) NULL,
    status TINYINT(1) DEFAULT 1 NOT NULL COMMENT '1 = Active, 0 = Inactive',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (inspection_id) REFERENCES inspections(id),
    FOREIGN KEY (aircraftId) REFERENCES aircrafts(id)
    );
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
          await queryRunner.query(`DROP TABLE IF EXISTS i_evaluation_history;`);
    }

}
