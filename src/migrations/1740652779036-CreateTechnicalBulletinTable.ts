import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTechnicalBulletinTable1740652779036
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE technical_bulletins (
                id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
                user_id INT(11) NOT NULL,
                org_id INT(11) NOT NULL,
                aircraft_id INT(11)  NOT NULL,
                sb_no VARCHAR(255) NULL,
                issue_date DATETIME NULL,
                revision VARCHAR(255) NULL,
                revision_date DATETIME NULL,
                category VARCHAR(255) NULL,
                ed_easa VARCHAR(255) NULL,
                ed_easa_issue_date DATETIME NULL,
                cdn VARCHAR(255) NULL,
                cdn_issue_date DATETIME NULL,
                pa_enac TEXT NULL,
                pa_enac_issue_date DATETIME NULL,
                effectivity TEXT NULL,
                title TEXT NULL,
                remark TEXT NULL,
                limit_type VARCHAR(255) NULL,
                hourly_periodicity_limit VARCHAR(255) NULL,
                calendar_periodicity_limit VARCHAR(255) NULL,
                cycle_periodicity VARCHAR(255) NULL,
                note TEXT NULL,
                type VARCHAR(255) NULL,
                tb_status VARCHAR(255) NULL,
                date DATETIME NULL,
                fa_ad VARCHAR(255) NULL,
                work_report TEXT NULL,
                remaining_days INT(10) NULL,
                remaining_hours INT(10) NULL,
                remaining_cycles INT(10) NULL,
                aircraft_type VARCHAR(255) NULL,
                appli_expiration_notice DATETIME NULL,
                tb_appli_expiration_hour INT(11) NULL,
                tb_appli_expiration_minutes INT(11) NULL,
                tb_appli_expiration_cycle INT(11) NULL,
                registration_mark VARCHAR(100) NULL,
                status TINYINT(1) DEFAULT 1 COMMENT '1 = Active',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at DATETIME NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (aircraft_id) REFERENCES aircrafts(id),
                FOREIGN KEY (org_id) REFERENCES organization(id)
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS technical_bulletins;`);
  }
}
