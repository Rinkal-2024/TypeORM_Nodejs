import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMovementsTable1742896873874 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                CREATE TABLE latest_movements (
                id INT(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
                user_id INT(11) NOT NULL,
                organizationId INT(11) NOT NULL,
                aircraftId INT(11) NOT NULL,
                type VARCHAR(50) NOT NULL,
                record_time DATETIME NULL,
                status TINYINT(1) DEFAULT 1 COMMENT '1 = Active',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at DATETIME NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (organizationId) REFERENCES organizations(id),
                FOREIGN KEY (aircraftId) REFERENCES aircrafts(id)
                );
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`DROP TABLE IF EXISTS latest_movements;`);
    }

}
