import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { UserRoles } from "./models/UserRoles";
import { Users } from "./models/Users";
import { Organizations } from "./models/Organizations";
import { Aircrafts } from "./models/Aircrafts";
import { seedUserRoles } from "./seeders/UserRoleSeeder";
import { Sessions } from "./models/Sessions";
import { TechnicalBulletins } from "./models/TechnicalBulletins";
import { EvaluationsHistory } from "./models/EvaluationsHistory";
import { WorkReports } from "./models/WorkReports";
import { Inspections } from "./models/Inspections";
import { InspectionsWorkReports } from "./models/InspectionsWorkReports";
import { Components } from "./models/Components";
import { InspectionEvaluationsHistory } from "./models/InspectionEvaluationsHistory";
import { LatestMovements } from "./models/LatestMovements";
import { MovementSubscriber } from "./MovementSubscriber";
import { AircraftClone } from "./models/AircraftsClone";
import { ComponentsEvaluations } from "./models/ComponentsEvaluations";

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

/**
 * Create the database connection, create the tables after the models
 */

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  charset: "utf8mb4_unicode_ci",
  entities: [
    Users,
    UserRoles,
    Organizations,
    Aircrafts,
    TechnicalBulletins,
    Sessions,
    EvaluationsHistory,
    WorkReports,
    Inspections,
    InspectionsWorkReports,
    Components,
    InspectionEvaluationsHistory,
    LatestMovements,
    AircraftClone,
    ComponentsEvaluations,
  ],
  synchronize: false,
  logging: false,
  name: "default",
  migrations: ["dist/migrations/**/*{.ts,.js}"],
  // subscribers: ["dist/subscriber/**/*{.ts,.js}", MovementSubscriber],
  subscribers: [MovementSubscriber],
});
AppDataSource.initialize()
  .then(async () => {
    // console.log("Database connected successfully!");
    await seedUserRoles(AppDataSource);
  })
  .catch((error) => console.log("Error connecting to database:", error));
