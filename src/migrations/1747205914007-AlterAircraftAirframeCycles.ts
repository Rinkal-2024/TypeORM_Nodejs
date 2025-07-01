import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAircraftAirframeCycles1747205914007 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE aircrafts
            MODIFY COLUMN airframeCycles INT(10) NULL;
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE aircrafts
            MODIFY COLUMN airframeCycles INT(10) NOT NULL;
          `);
    }

}
