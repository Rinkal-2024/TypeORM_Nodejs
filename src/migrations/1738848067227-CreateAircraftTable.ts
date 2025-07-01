import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAircraftTable1738848067227 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE aircrafts (
        id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
        organizationId INT(11) NOT NULL,
        type VARCHAR(100) NOT NULL,
        registrationMark VARCHAR(100) NOT NULL,
        serialNumber VARCHAR(100) NOT NULL,
        manufacturer VARCHAR(100) NOT NULL,
        manufacturerDate VARCHAR(50) NOT NULL,
        aircraftType VARCHAR(100) NOT NULL,
        expiredAt DATETIME NOT NULL,
        fuelType VARCHAR(100) NOT NULL,
        hasEngine2 TINYINT(1) NOT NULL,
        hasTripFuel TINYINT(1) NOT NULL,
        airframeHours VARCHAR(100) NOT NULL,
        airframeCycles INT(10) NOT NULL,
        engine1Hours VARCHAR(100) NULL,
        engine1N1 INT(10) NULL,
        engine1N2 INT(10)  NULL,
        engine1Imp INT(10) NULL,
        engine2Hours VARCHAR(100) NULL,
        engine2N1 INT(10) NULL,
        engine2N2 INT(10) NULL,
        engine2Imp INT(10) NULL,
        emptyWeight INT(10) NULL,
        status TINYINT(1) NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deletedAt DATETIME NULL,
        FOREIGN KEY (organizationId) REFERENCES organizations (id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS aircrafts;`);
  }
}
