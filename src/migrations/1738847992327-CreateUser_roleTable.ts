import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserRoleTable1738847992327 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE user_role (
    id INT(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
    role VARCHAR(50) NOT NULL,
    status TINYINT(1) DEFAULT 1 COMMENT '1 = Active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
   `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(`DROP TABLE IF EXISTS user_role;`);
  }
}