import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEvaluationHistoryTable1740652892681
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE tb_evaluation_histories (
        id INT(11) PRIMARY KEY AUTO_INCREMENT,
        user_id INT(11) NOT NULL,
        technical_bulletin_id INT(11) NOT NULL,
        aircraftId INT(11) NOT NULL,
        eh_status VARCHAR(255) NULL,
        title TEXT NULL,
        easa_ad VARCHAR(255) NULL,
        fa_ad VARCHAR(255) NULL,
        service_bulletin TEXT NULL,
        evaluation_date DATETIME NULL,
        work_report TEXT NULL,
        note TEXT NULL,
        status TINYINT(1) DEFAULT 1 COMMENT '1 = Active',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (technical_bulletin_id) REFERENCES technical_bulletins(id),
        FOREIGN KEY (aircraftId) REFERENCES aircrafts(id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS evaluation_history;`);
  }
}
