import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrganizationTable1738848041631
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE organizations (
        id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
        organizationId VARCHAR(255) NOT NULL,
        status TINYINT(1) DEFAULT 1 COMMENT '1 = Active',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS organizations;`);
  }
}