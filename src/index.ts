import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { UserRole } from "./models/UsersRole";
import { Users } from "./models/UsersModel";
import { Organization } from "./models/OrganizationsModel";
import { Aircraft } from "./models/AircraftsModel";
import { seedUserRoles } from "./seeders/UserRoleSeeder";
import { TechincalBullettins } from "./models/TechincalBullettinsModel";

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
  entities: [Users, UserRole, Organization, Aircraft, TechincalBullettins],
  synchronize: false,
  logging: false,
  name: "default",
  migrations: ["dist/migrations/**/*{.ts,.js}"],
  subscribers: ["dist/subscriber/**/*{.ts,.js}"],
});
AppDataSource.initialize()
  .then(async () => {
    // console.log("Database connected successfully!");
    await seedUserRoles(AppDataSource);
  })
  .catch((error) => console.log("Error connecting to database:", error));
