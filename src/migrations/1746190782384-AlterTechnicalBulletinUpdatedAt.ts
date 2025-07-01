import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTechnicalBulletinUpdatedAt1746190782384 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`
      ALTER TABLE technical_bulletins
      MODIFY COLUMN updated_at TIMESTAMP NULL;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`
      ALTER TABLE technical_bulletins
      MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
    `);
    }

}
