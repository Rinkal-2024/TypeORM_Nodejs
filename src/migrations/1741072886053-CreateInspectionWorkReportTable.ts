import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInspectionWorkReportTable1741072886053 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE i_work_report (
    id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
    user_id INT(11) NOT NULL,
    inspection_id INT(11) NOT NULL,
    aircraftId INT(11) NOT NULL,
    wr_no VARCHAR(255) NULL,
    chapter_section_subject TEXT NULL ,
    ata_title VARCHAR(255) NULL,
    task_number VARCHAR(255) NULL,
    task_title VARCHAR(255) NULL,
    description TEXT NULL,
    mpn VARCHAR(255) NULL,
    pn VARCHAR(255) NULL,
    ref_manual TEXT NULL,
    documentation TEXT NULL,
    sub_task VARCHAR(255) NULL,
    signature TEXT NULL,
    additional_control TEXT NULL,
    notes_measurements TEXT NULL,
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
    await queryRunner.query(`DROP TABLE IF EXISTS inspections_history;`);
    }

}
