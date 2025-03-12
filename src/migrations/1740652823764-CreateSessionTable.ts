import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSessionTable1740652823764 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE sessions (
          id INT(11) AUTO_INCREMENT PRIMARY KEY,
          userId INT(11),
          token VARCHAR(1024) NOT NULL,
          loginAt DATETIME NOT NULL COMMENT 'YYYY-MM-DD HH:mm',
          loggedOutAt DATETIME DEFAULT NULL COMMENT 'YYYY-MM-DD HH:mm',
          FOREIGN KEY (userId) REFERENCES users(id)
        );

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS sessions;`);
  }
}
