import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrganizationTable1738848041631
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE organization (
        id INT(11) PRIMARY KEY AUTO_INCREMENT Not Null,
        org_id VARCHAR(255) NOT NULL,
        status TINYINT(1) DEFAULT 1 COMMENT '1 = Active',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS organization;`);
  }
}