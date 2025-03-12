import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInspectionHistoryTable1741072886053 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE i_work_report (
    id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
    user_id INT(11) NOT NULL,
    aircraft_id INT(11) NOT NULL,
    wr_no VARCHAR(255) NULL,
    title VARCHAR(255) NULL,
    wr_date DATETIME NULL,
    remaining_days INT(10) NULL,
    remaining_hours INT(10) NULL,
    remaining_cycles INT(10) NULL,
    expiry_date DATETIME NULL,
    last_date DATETIME NULL,
    work_report TEXT NULL,
    signature TEXT NULL,
    additional_control TEXT NULL,
    notes_measurements TEXT NULL,
    status TINYINT(1) DEFAULT 1 NOT NULL COMMENT '1 = Active, 0 = Inactive',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (aircraft_id) REFERENCES aircrafts(id)
);
   `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS inspections_history;`);
    }

}
