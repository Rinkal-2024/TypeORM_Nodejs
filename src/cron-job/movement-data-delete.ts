import { LatestMovements } from "../models/LatestMovements";
import { AppDataSource } from "../index";
import * as cron from "node-cron";

const deleteOldData = async () => {
  try {
    console.log(process.env.PRODUCTION, "Hello");
    await AppDataSource.query(`SET SQL_SAFE_UPDATES = 0;`);
    const queryBuilder = AppDataSource.getRepository(LatestMovements)
      .createQueryBuilder("movement")
      .delete()
      .where(
        `created_at < NOW() - INTERVAL 5 DAY
             AND id NOT IN (
                SELECT id FROM (
                  SELECT id
                  FROM (
                    SELECT id,
                           ROW_NUMBER() OVER (PARTITION BY user_id, aircraftId, organizationId ORDER BY created_at DESC) AS rn
                    FROM latest_movements
                    WHERE created_at < NOW() - INTERVAL 5 DAY
                  ) AS ranked
                  WHERE ranked.rn > 5
                ) AS limited_entries
             )`
      );

    console.log(queryBuilder.getQuery(), "SQL Query");
    const dataEntryRepository = await queryBuilder.execute();

    console.log(dataEntryRepository, "dataEntryRepository");
    console.log(`Deleted ${dataEntryRepository.affected} entries.`);
    await AppDataSource.query(`SET SQL_SAFE_UPDATES = 1;`);
  } catch (error) {
    console.error("Error cleaning up old data:", error);
  }
};

export const cronJob = cron.schedule("*/30 * * * * *", () => {
  console.log("Running cleanup task...");
  deleteOldData();
});
