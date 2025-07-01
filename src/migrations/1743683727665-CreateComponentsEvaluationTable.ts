import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateComponentsEvaluationTable1743683727665 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query(`
    CREATE TABLE  c_evaluation_histories (
    id INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
    user_id INT(11) NOT NULL,
    component_id INT(11) NOT NULL,
    aircraftId INT(11) NOT NULL,
    cycle_type VARCHAR(255) NULL,
    c_key VARCHAR(255) NULL,
    applicable enum('Yes','No') NULL,
    motivation text NULL,
    status TINYINT(1) DEFAULT 1 NOT NULL COMMENT '1 = Active, 0 = Inactive',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (component_id) REFERENCES components(id),
    FOREIGN KEY (aircraftId) REFERENCES aircrafts(id)
         );
    `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS c_evaluation_histories;`);
    }

}
