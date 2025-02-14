import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1738848055970 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE users (
    id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
    org_id INT(11) NOT NULL,
    role INT(11) NOT NULL,
    first_name VARCHAR(50) NULL,
    last_name VARCHAR(50) NULL,
    mobile VARCHAR(20) NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (org_id) REFERENCES organization(id) ON DELETE CASCADE,
    FOREIGN KEY (role) REFERENCES user_role(id) ON DELETE CASCADE
     );
     `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}