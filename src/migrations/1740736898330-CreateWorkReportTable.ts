import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkReportTable1740736898330 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE tb_work_report (
        id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
        user_id INT(11) NULL,
        aircraft_id INT(11) NOT NULL,
        wr_no VARCHAR(100),
        sb_no VARCHAR(255) NULL,
        ed_easa VARCHAR(255) NULL,
        cdn VARCHAR(255) NULL,
        pa_enac TEXT NULL,
        title TEXT NULL,
        remark TEXT NULL,
        limit_type VARCHAR(255) NULL,
        note TEXT NULL,
        signature TEXT NULL,
        additional_control TEXT NULL,
        notes_measurements TEXT NULL,
        status TINYINT(1) DEFAULT 1 NOT NULL COMMENT '1 = Active, 0 = Inactive',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (aircraft_id) REFERENCES aircrafts(id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS technical_bulletins_work_report;`
    );
  }
}
