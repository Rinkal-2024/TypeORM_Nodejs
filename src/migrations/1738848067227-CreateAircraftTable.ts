import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAircraftTable1738848067227 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE aircrafts (
        id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
        org_id INT(11) NOT NULL,
        type VARCHAR(100) NOT NULL,
        registration_mark VARCHAR(100) NOT NULL,
        serial_number VARCHAR(100) NOT NULL,
        manufacturer VARCHAR(100) NOT NULL,
        manufacturer_date VARCHAR(50) NOT NULL,
        aircraft_type VARCHAR(100) NOT NULL,
        expire_at DATETIME NOT NULL,
        fuel_type VARCHAR(100) NOT NULL,
        has_engine2 TINYINT(1) NOT NULL,
        has_trip_fuel TINYINT(1) NOT NULL,
        airframe_hours VARCHAR(100) NOT NULL,
        airframe_cycles INT(10) NOT NULL,
        engine1_hours VARCHAR(100) NOT NULL,
        engine1_n1 INT(10) NOT NULL,
        engine1_n2 INT(10) NOT NULL,
        engine1_imp INT(10) NOT NULL,
        engine2_hours VARCHAR(100),
        engine2_n1 INT(10),
        engine2_n2 INT(10),
        engine2_imp INT(10),
        empyt_weight INT(10),
        status TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        deleted_at DATETIME NULL,
        FOREIGN KEY (org_id) REFERENCES organization (id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS aircrafts;`);
  }
}
