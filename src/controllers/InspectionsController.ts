import { Request, Response } from "express";
import { AppDataSource } from "../index";
import { Inspections } from "../models/Inspections";
import { InspectionsWorkReports } from "../models/InspectionsWorkReports";
import * as XLSX from "xlsx";
import multer = require("multer");
import { Users } from "../models/Users";
import { InspectionEvaluationsHistory } from "../models/InspectionEvaluationsHistory";
// import { Brackets, In } from "typeorm";
import { Aircrafts } from "../models/Aircrafts";

const inspectionRepository = AppDataSource.getRepository(Inspections);
const inspectionEvaluationRepository = AppDataSource.getRepository(
  InspectionEvaluationsHistory
);
const inspectionHistoryRepository = AppDataSource.getRepository(
  InspectionsWorkReports
);
const userRepository = AppDataSource.getRepository(Users);
const aircraftRepository = AppDataSource.getRepository(Aircrafts);

const upload = multer({ dest: "uploads/" });
export const uploadInspectionExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded!");
    }
    // const aircraftData = JSON.parse(req.body.aircrafts);
    let aircraftData = req.body.aircrafts;
    if (typeof aircraftData === "string") {
      aircraftData = JSON.parse(aircraftData);
    }
    const manufacturer = aircraftData.aircrafts_manufacturer;
    const aircraftType = aircraftData.aircraftType;
    const organizationId = parseInt(req.body.orgId);
    if (!Array.isArray(aircraftData)) {
      aircraftData = [aircraftData];
    }

    const aircraftsFromDb = await aircraftRepository.find({
      where: {
        manufacturer,
        aircraftType,
        organizationId,
      },
    });

    const fileExtension = req.file.originalname.split(".").pop()?.toLowerCase();
    if (fileExtension !== "xlsx") {
      return res
        .status(400)
        .send({ status: 400, message: "File must be in .xlsx format!" });
    }
    const workBook = XLSX.readFile(req.file.path);
    const sheetName = workBook.SheetNames[0];
    const sheet = workBook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);
    const userId = req.user.userId;

    if (!userId) {
      return res.status(400).send("Invalid user!");
    }
    const removeData = data.filter((ik: any) => {
      if (ik.hasOwnProperty("Unit 2")) {
        if (ik["Unit 2"] === "ED") {
          return true;
        }
        return false;
      }
      return false;
    });

    const keepData = data.filter((ik: any) => {
      if (ik.hasOwnProperty("Unit 2")) {
        if (ik["Unit 2"] === "ED") {
          return false;
        }
        return true;
      }
      return true;
    });
        const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split("/");
      return new Date(`${year}-${month}-${day}`);
    };

    const inspectionData: any[] = [];
    for (const record of keepData) {
      const createInspection = {
        user_id: userId,
        revision: record.Revision,
        revision_date: parseDate(record["Revision Date"]),
        atachapter: record.ATAChapter,
        chapter_section_subject: record["Chapter Section Subject"],
        ata_title: record["ATA Title"],
        task_number: record["Task number"],
        task_title: record["Task Title"],
        mod: record.MOD,
        climatic_condition: record["Climatic Condition"],
        description: record.Description,
        mpn: record.MPN,
        pn: record.PN,
        maintenance_mode: record["Maintenance Mode"],
        frequency: record.Frequency ? record.Frequency.toUpperCase() : null,
        limit_1: record["Limit 1"],
        unit_1: record["Unit 1"],
        margin_1: record["Margin 1"],
        margin_unit_1: record["Margin Unit 1"],
        limit_2: Object.prototype.hasOwnProperty.call(record, "FS 2")
          ? record["FS 2"].includes("TSI") && record["FS 2"].includes("TSM")
            ? record["Limit 2"].split("\r\n")[0]
            : record["Limit 2"]
          : record["Limit 2"],
        unit_2: Object.prototype.hasOwnProperty.call(record, "FS 2")
          ? record["FS 2"].includes("TSI") && record["FS 2"].includes("TSM")
            ? record["Unit 2"].split("\r\n")[0]
            : record["Unit 2"]
          : record["Unit 2"],
        margin_2: record["Margin 2"],
        margin_unit_2: record["Margin Unit 2"],
        limit_3: record["Limit 3"],
        unit_3: record["Unit 3"],
        margin_3: record["Margin 3"],
        margin_unit_3: record["Margin Unit 3"],
        ref_manual: record["Ref Manual"],
        documentation: record.Documentation,
        i_key: record.KEY,
        cycle_type: record["CYCLE TYPE"],
      };
      inspectionData.push(createInspection);
    }
    const dataTosave = aircraftsFromDb.map((ik: any) => {
      const inspectionDatas = inspectionData.map((item: any) => {
        return {
          ...item,
          organizationId: parseInt(req.body.orgId),
          aircraftId: ik.id,
        };
      });
      return inspectionDatas;
    });
    const inspectionSave = await inspectionRepository.save(dataTosave.flat());
    res.status(200).send({
      status: 200,
      message: `Excel data has been successfully saved to the database. ${
        removeData.length > 0 ? "Data with ED in UNit 2 has been ignored" : ""
      }`,
      data: inspectionSave,
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: "An error occurred while processing the file.",
    });
  }
};

export const getInspectionData = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = (req.query.search as string) || "";
    const typeFilter = (req.query.type as string) || "";
    const keyFilter = (req.query.key as string) || "";
    const statusFilter = (req.query.status as string) || "";
    const offset = (page - 1) * limit;
    const dir = (req.query.order as any) || "";
    const field = (req.query.field as string) || "";
    const aircraftId = req.query.aircraftId
      ? parseInt(req.query.aircraftId as string)
      : null;

    const databaseId = req.query.readonlyvar === "true";
    const aircraftTypeId = req.query.isInitial === "true";

    const user = await userRepository.findOne({
      where: { id: parseInt(userId) },
      relations: ["organization"],
    });

    const org_id = user.organization.id;
    const query = inspectionRepository
      .createQueryBuilder("inspectionWork")
      .select([
        "inspectionWork.id AS id",
        "inspectionWork.user_id AS user_id",
        "inspectionWork.aircraftId AS aircraftId",
        "inspectionWork.applicable AS applicable",
        "inspectionWork.motivation AS motivation",
        "inspectionWork.organizationId AS organizationId",
        "inspectionWork.aircraft_type AS aircraft_type",
        "inspectionWork.revision AS revision",
        "inspectionWork.revision_date AS revision_date",
        "inspectionWork.atachapter AS atachapter",
        "inspectionWork.chapter_section_subject AS chapter_section_subject",
        "inspectionWork.ata_title AS ata_title",
        "inspectionWork.task_number AS task_number",
        "inspectionWork.task_title AS task_title",
        "inspectionWork.modes AS modes",
        "inspectionWork.climatic_condition AS climatic_condition",
        "inspectionWork.description AS description",
        "inspectionWork.mpn AS mpn",
        "inspectionWork.pn AS pn",
        "inspectionWork.maintenance_mode AS maintenance_mode",
        "inspectionWork.frequency AS frequency",
        "inspectionWork.limit_1 AS limit_1",
        "inspectionWork.unit_1 AS unit_1",
        "inspectionWork.margin_1 AS margin_1",
        "inspectionWork.margin_unit_1 AS margin_unit_1",
        "inspectionWork.limit_2 AS limit_2",
        "inspectionWork.unit_2 AS unit_2",
        "inspectionWork.margin_2 AS margin_2",
        "inspectionWork.margin_unit_2 AS margin_unit_2",
        "inspectionWork.limit_3 AS limit_3",
        "inspectionWork.unit_3 AS unit_3",
        "inspectionWork.margin_3 AS margin_3",
        "inspectionWork.margin_unit_3 AS margin_unit_3",
        "inspectionWork.documentation AS documentation",
        "inspectionWork.cycle_type AS cycle_type",
        "inspectionWork.ref_manual AS ref_manual",
        "inspectionWork.i_status AS i_status",
        "inspectionWork.i_key AS i_key",
        "inspectionWork.status AS status",
        "inspectionWork.work_report AS work_report",
        "inspectionWork.exp_date_close AS exp_date_close",
        "inspectionWork.exp_hours_close AS exp_hours_close",
        "inspectionWork.exp_cycles_close AS exp_cycles_close",
        "inspectionWork.deleted_at AS deleted_at",
        "inspectionWork.created_at AS created_at",
        "inspectionWork.updated_at AS updated_at",
        "aircraft.airframeHours AS airframeHours",
        "aircraft.expiredAt AS expiredAt",
        "aircraft.airframeCycles AS airframeCycles",
        "DATE(TIMESTAMPADD(DAY, COALESCE(CAST(inspectionWork.limit_2 AS SIGNED), 0), NOW())) AS total_days_time",
        // "TIMESTAMPDIFF(DAY, NOW(), TIMESTAMPADD(DAY, COALESCE(CAST(inspectionWork.limit_2 AS SIGNED), 0), NOW())) AS remaining_days",
        // "DATEDIFF(TIMESTAMPADD(DAY, COALESCE(CAST(inspectionWork.limit_2 AS SIGNED), 0), NOW()), NOW()) AS days_tolerance",
        `SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) AS airframe_hours_only_hours`,
        `SUBSTRING_INDEX(SUBSTRING_INDEX(aircraft.airframeHours, ':', -1), ' ', 1) AS airframe_hours_only_minutes`,
        `IF ((SELECT wr_no FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY inspection_date DESC LIMIT 1) IS NOT NULL,
        FLOOR(SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) + COALESCE(CAST(inspectionWork.limit_1 AS SIGNED), 0)),NULL) AS updated_hours`,
        // `FLOOR((SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) + COALESCE(CAST(inspectionWork.limit_1 AS SIGNED), 0)) - SUBSTRING_INDEX(aircraft.airframeHours, ':', 1)) AS remaining_hours`,
        `LPAD(FLOOR(((TIME_TO_SEC(aircraft.airframeHours) % 3600) / 60) + COALESCE(CAST(inspectionWork.limit_1 AS SIGNED), 0)), 2, '0') AS remaining_minutes`,
        // `DATE_ADD(TIMESTAMPADD(DAY, COALESCE(CAST(inspectionWork.limit_2 AS SIGNED), 0), NOW()), INTERVAL COALESCE(CAST(inspectionWork.limit_2 AS SIGNED), 0) DAY) AS expiration_tolerance`,
        // `DATE_ADD((SELECT next_date_exp FROM i_evaluation_histories WHERE inspection_id = inspectionWork.id ORDER BY next_date_exp DESC LIMIT 1),
        // INTERVAL CASE inspectionWork.margin_unit_2 WHEN 'D' THEN inspectionWork.margin_2 WHEN 'M' THEN inspectionWork.margin_2 * 30 WHEN 'Y' THEN inspectionWork.margin_2 * 365 ELSE 0 END DAY) AS expiration_tolerance`,
        `IF ((SELECT wr_no FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY inspection_date DESC LIMIT 1) IS NOT NULL,
        DATE_ADD((SELECT next_date_exp FROM i_evaluation_histories WHERE inspection_id = inspectionWork.id ORDER BY next_date_exp DESC LIMIT 1),
        INTERVAL CASE WHEN inspectionWork.margin_unit_2 = 'D' THEN inspectionWork.margin_2 WHEN inspectionWork.margin_unit_2 = 'M' THEN inspectionWork.margin_2 * 30 WHEN inspectionWork.margin_unit_2 = 'Y' THEN inspectionWork.margin_2 * 365
        ELSE 0 END DAY),NULL) AS expiration_tolerance`,
        `DATE_FORMAT(DATE_ADD(TIMESTAMPADD(DAY, COALESCE(CAST(inspectionWork.limit_2 AS SIGNED), 0), NOW()), INTERVAL COALESCE(CAST(inspectionWork.limit_2 AS SIGNED), 0) DAY), '%Y-%m-%d') AS expiration_tolerance_formatted`,
        `(COALESCE(CAST(SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) AS SIGNED),0) + FLOOR((SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) + COALESCE(CAST(inspectionWork.limit_1 AS SIGNED), 0)) - SUBSTRING_INDEX(aircraft.airframeHours, ':', 1))) AS landing_by_the_hours`,
        `CONCAT(LPAD(FLOOR(TIMESTAMPDIFF(MINUTE, NOW(), TIMESTAMPADD(DAY, COALESCE(CAST(inspectionWork.limit_2 AS SIGNED), 0), NOW())) / 60), 2, '0'), ':', LPAD(TIMESTAMPDIFF(MINUTE, NOW(), TIMESTAMPADD(DAY, COALESCE(CAST(inspectionWork.limit_2 AS SIGNED), 0), NOW())) % 60, 2, '0')) AS landing_by_the_hours`,
        // `(COALESCE(CAST(inspectionWork.limit_1 AS SIGNED), 0) + FLOOR((SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) + COALESCE(CAST(inspectionWork.limit_1 AS SIGNED), 0)) - SUBSTRING_INDEX(aircraft.airframeHours, ':', 1))) AS hours_tolerance`,
        `IF ((SELECT wr_no FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY inspection_date DESC LIMIT 1) IS NOT NULL,
        (COALESCE(CAST(aircraft.airframeCycles AS SIGNED), 0) + COALESCE(CAST(inspectionWork.limit_3 AS SIGNED), 0)),NULL) AS updated_cycles`,
        // `(((COALESCE(CAST(aircraft.airframeCycles AS SIGNED), 0) + COALESCE(CAST(inspectionWork.limit_3 AS SIGNED), 0)) - COALESCE(CAST(aircraft.airframeCycles AS SIGNED), 0)) + COALESCE(CAST(inspectionWork.limit_3 AS SIGNED), 0)) AS remaining_cycles_toll`,
        `(SELECT inspection_date FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY inspection_date DESC LIMIT 1) AS inspection_date`,
        `(SELECT inspection_requested_date FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY inspection_requested_date DESC LIMIT 1) AS inspection_requested_date`,
        `(SELECT wr_no FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY inspection_date DESC LIMIT 1) AS wr_no`,
        `(SELECT next_date_exp FROM i_evaluation_histories WHERE inspection_id = inspectionWork.id ORDER BY next_date_exp DESC LIMIT 1) AS next_date_exp`,
        `(SELECT id FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY id DESC LIMIT 1) AS work_report_id`,
        `IF((SELECT wr_no FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY inspection_date DESC LIMIT 1) IS NOT NULL,
        NULLIF (TIMESTAMPDIFF(DAY, NOW(), TIMESTAMPADD(DAY, COALESCE(CAST(inspectionWork.limit_2 AS SIGNED), 0), NOW())) , 0),NULL) AS remaining_days`,
        `(SELECT NULLIF (COALESCE(next_cycles_exp, 0) - COALESCE(CAST(aircraft.airframeCycles AS SIGNED), 0), 0) FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY   inspection_date DESC  LIMIT 1) AS remaining_cycles`,
        `IF ((SELECT wr_no FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY inspection_date DESC LIMIT 1) IS NOT NULL,
        TIMESTAMPDIFF( DAY, NOW(), TIMESTAMPADD(DAY, COALESCE(CAST(inspectionWork.limit_2 AS SIGNED), 0) +
        COALESCE(CASE inspectionWork.margin_unit_2 WHEN 'D' THEN CAST(inspectionWork.Margin_2 AS SIGNED)
        WHEN 'M' THEN CAST(inspectionWork.Margin_2 AS SIGNED) * 30  WHEN 'Y' THEN CAST(inspectionWork.Margin_2 AS SIGNED) * 365 ELSE 0 END, 0), NOW() ) ), NULL ) AS days_tolerance `,
        `IF((SELECT wr_no FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY inspection_date DESC LIMIT 1) IS NOT NULL,
        FLOOR((SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) + COALESCE(CAST(inspectionWork.limit_1 AS SIGNED), 0)) - SUBSTRING_INDEX(aircraft.airframeHours, ':', 1)),NULL) AS remaining_hours`,
        `IF((SELECT wr_no FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY inspection_date DESC LIMIT 1) IS NOT NULL, FLOOR((SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) + COALESCE(CAST(inspectionWork.limit_1 AS SIGNED), 0)) - SUBSTRING_INDEX(aircraft.airframeHours, ':', 1)) + COALESCE(CAST(inspectionWork.margin_1 AS SIGNED), 0),
          NULL) AS hours_tolerance`,
        // `IF((SELECT wr_no FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY inspection_date DESC LIMIT 1) IS NOT NULL,
        // (COALESCE(CAST(inspectionWork.limit_1 AS SIGNED), 0) + FLOOR((SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) + COALESCE(CAST(inspectionWork.limit_1 AS SIGNED), 0)) - SUBSTRING_INDEX(aircraft.airframeHours, ':', 1))),NULL) AS hours_tolerance`,
        `(SELECT NULLIF (COALESCE(next_cycles_exp, 0) - COALESCE(CAST(aircraft.airframeCycles AS SIGNED), 0)
            + COALESCE(inspectionWork.margin_3, 0) , 0) FROM i_work_report WHERE inspection_id = inspectionWork.id ORDER BY inspection_date DESC  LIMIT 1) AS remaining_cycles_toll`,
      ])
      .leftJoin("inspectionWork.inspectionHistory", "i_work_report")
      .leftJoin(
        "inspectionWork.inspectionEvaluationHistory",
        "i_evaluation_histories"
      )
      .leftJoin("inspectionWork.aircraft", "aircraft");

    if (databaseId === true) {
      query.andWhere("inspectionWork.organizationId = :org_id", { org_id });
      if (aircraftTypeId === false) {
        query.andWhere("inspectionWork.aircraftId = :aircraftId", {
          aircraftId,
        });
      }
    }
    if (databaseId === false) {
      query.andWhere(
        `
        (
          inspectionWork.aircraftId = :aircraftId
          AND (
            inspectionWork.frequency != 'PUNCTUAL'
            OR (
              inspectionWork.frequency = 'PUNCTUAL'
              AND (
                inspectionWork.i_status IS NULL
                OR LOWER(TRIM(inspectionWork.i_status)) != 'done'
              )
            )
          )
        )
      `,
        { aircraftId }
      );
    }
    // if (databaseId === false) {
    //   query.andWhere("inspectionWork.aircraftId = :aircraftId", {
    //     aircraftId,
    //   });
    //   query.andWhere(`inspectionWork.frequency != 'PUNCTUAL'
    //         OR (
    //           inspectionWork.frequency = 'PUNCTUAL'
    //           AND (
    //             inspectionWork.i_status IS NULL
    //             OR LOWER(TRIM(inspectionWork.i_status)) != 'done'
    //           )
    //         )
    //      `);
    // }

    if (typeFilter) {
      if (typeFilter === "x") {
        query.andWhere("inspectionWork.applicable IS NULL");
      } else {
        query.andWhere("inspectionWork.applicable = :typeFilter", {
          typeFilter,
        });
      }
    }

    if (statusFilter) {
      if (statusFilter === "x") {
        query.andWhere("inspectionWork.i_status IS NULL");
      } else {
        query.andWhere("inspectionWork.i_status = :statusFilter", {
          statusFilter,
        });
      }
    }

    if (keyFilter) {
      query.andWhere("inspectionWork.i_key = :keyFilter", {
        keyFilter,
      });
    }

    if (searchQuery) {
      query.andWhere(
        `(${
          [
            "aircraft_type",
            "revision",
            "revision_date",
            "atachapter",
            "chapter_section_subject",
            "ata_title",
            "task_number",
            "task_title",
            "modes",
            "climatic_condition",
            "description",
            "mpn",
            "pn",
            "maintenance_mode",
            "frequency",
            "limit_1",
            "unit_1",
            "margin_1",
            "margin_unit_1",
            "limit_2",
            "unit_2",
            "margin_2",
            "margin_unit_2",
            "limit_3",
            "unit_3",
            "margin_3",
            "margin_unit_3",
            "ref_manual",
            "documentation",
            "cycle_type",
            "i_key",
          ]
            .map((field) => `inspectionWork.${field} LIKE :searchQuery`)
            .join(" OR ") + " OR i_evaluation_histories.wr_no LIKE :searchQuery"
        })`,
        { searchQuery: `%${searchQuery}%` }
      );
    }
    if (databaseId === true) {
      query.addGroupBy(`inspectionWork.id,inspectionWork.organizationId`);
      if (aircraftTypeId === false) {
        query.addGroupBy(
          `inspectionWork.id,inspectionWork.aircraftId,inspectionWork.organizationId`
        );
      }
    }

    if (databaseId === false) {
      query.addGroupBy(
        `inspectionWork.id,inspectionWork.aircraftId,inspectionWork.organizationId`
      );
    }
    if (field.length > 0 && dir.length > 0) {
      query.addOrderBy(field, dir.toUpperCase()).offset(offset).limit(limit);
    } else {
      query
        .addOrderBy("inspectionWork.created_at", "DESC")
        .offset(offset)
        .limit(limit);
    }

    const inspectionWorkReport = await query.getRawMany();
    const totalCountQuery = AppDataSource.getRepository(Inspections)
      .createQueryBuilder("inspectionWork")
      .select("COUNT(*) AS totalCount")
      .leftJoin("inspectionWork.aircraft", "aircraft")
      .leftJoin(
        "inspectionWork.inspectionEvaluationHistory",
        "i_evaluation_histories"
      );
    if (databaseId === true) {
      totalCountQuery.andWhere("inspectionWork.organizationId = :org_id", {
        org_id,
      });
      if (aircraftTypeId === false) {
        totalCountQuery.andWhere("inspectionWork.aircraftId = :aircraftId", {
          aircraftId,
        });
      }
    }
    if (databaseId === false) {
      totalCountQuery.andWhere(
        `
        (
          inspectionWork.aircraftId = :aircraftId
          AND (
            inspectionWork.frequency != 'PUNCTUAL'
            OR (
              inspectionWork.frequency = 'PUNCTUAL'
              AND (
                inspectionWork.i_status IS NULL
                OR LOWER(TRIM(inspectionWork.i_status)) != 'done'
              )
            )
          )
        )
      `,
        { aircraftId }
      );
    }
    if (typeFilter) {
      if (typeFilter === "x") {
        totalCountQuery.andWhere("inspectionWork.applicable IS NULL");
      } else {
        totalCountQuery.andWhere("inspectionWork.applicable = :typeFilter", {
          typeFilter,
        });
      }
    }

    if (keyFilter) {
      totalCountQuery.andWhere("inspectionWork.i_key = :keyFilter", {
        keyFilter,
      });
    }

    if (statusFilter) {
      if (statusFilter === "x") {
        query.andWhere("inspectionWork.i_status IS NULL");
        totalCountQuery.andWhere("inspectionWork.i_status IS NULL");
      } else {
        query.andWhere("inspectionWork.i_status = :statusFilter", {
          statusFilter,
        });
        totalCountQuery.andWhere("inspectionWork.i_status = :statusFilter", {
          statusFilter,
        });
      }
    }

    if (searchQuery) {
      totalCountQuery.andWhere(
        `(${
          [
            "aircraft_type",
            "revision",
            "revision_date",
            "atachapter",
            "chapter_section_subject",
            "ata_title",
            "task_number",
            "task_title",
            "modes",
            "climatic_condition",
            "description",
            "mpn",
            "pn",
            "maintenance_mode",
            "frequency",
            "limit_1",
            "unit_1",
            "margin_1",
            "margin_unit_1",
            "limit_2",
            "unit_2",
            "margin_2",
            "margin_unit_2",
            "limit_3",
            "unit_3",
            "margin_3",
            "margin_unit_3",
            "ref_manual",
            "documentation",
            "cycle_type",
            "i_key",
          ]
            .map((field) => `inspectionWork.${field} LIKE :searchQuery`)
            .join(" OR ") + " OR i_evaluation_histories.wr_no LIKE :searchQuery"
        })`,
        { searchQuery: `%${searchQuery}%` }
      );
    }

    const totalResult = await totalCountQuery.getRawOne();
    const totalRecords = parseInt(totalResult?.totalCount || "0", 10);

    if (inspectionWorkReport.length === 0) {
      return res.status(200).send({
        status: 200,
        message: "No inspection found matching the provided filters.",
        data: [],
      });
    }

    return res.status(200).send({
      status: 200,
      message: "Inspection data retrieved successfully.",
      page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords: totalRecords,
      data: inspectionWorkReport,
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const insertInspectionAndWorkReport = async (
  req: Request,
  res: Response
) => {
  try {
    const { inspections } = req.body;
    const user_id = req.user.userId;
    if (!user_id) {
      return res.status(400).json({ status: 400, message: "Invalid user ID" });
    }

    if (!Array.isArray(inspections)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid inspections data. Expected an array.",
      });
    }
    let workNo = "WR_01";
    const lastWorkReport = await inspectionHistoryRepository
      .createQueryBuilder("work_reports")
      .orderBy("work_reports.id", "DESC")
      .getOne();

    if (lastWorkReport?.wr_no) {
      const lastNumber = parseInt(lastWorkReport.wr_no.split("_")[1], 10) || 0;
      const nextNumber = lastNumber + 1;
      workNo = `WR_${String(nextNumber).padStart(2, "0")}`;
    }

    const workReports = inspections.map((inspection: any) => ({
      user_id: user_id,
      aircraftId: inspection.aircraftId,
      inspection_id: inspection.id,
      wr_no: workNo,
      chapter_section_subject: inspection.chapter_section_subject,
      ata_title: inspection.ata_title,
      task_number: inspection.task_number,
      task_title: inspection.task_title,
      description: inspection.description,
      mpn: inspection.mpn,
      pn: inspection.pn,
      ref_manual: inspection.ref_manual,
      documentation: inspection.documentation,
      inspection_date: inspection.inspection_date,
      next_date_exp: inspection.exp_date,
      insp_hours: inspection.insp_hours,
      next_hours_exp: inspection.exp_hours,
      insp_cycles: inspection.insp_cycles,
      next_cycles_exp: inspection.exp_cycles,
      work_report: inspection.work_report,
      inspection_requested_date: inspection.inspection_requested_date,
    }));
    const savedWorkReports = await inspectionHistoryRepository.save(
      workReports
    );

    for (const inspection of inspections) {
      await inspectionRepository.update(
        { id: inspection.id },
        {
          user_id: user_id,
          aircraftId: inspection.aircraftId,
          work_report: inspection.work_report,
          i_status: "pending",
        }
      );
    }

    res.status(201).json({
      status: 201,
      message: `Successfully inserted ${savedWorkReports.length} work reports.`,
      workReportData: savedWorkReports,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error while inserting data.",
      error: error.message,
    });
  }
};

export const inspectionWorkReportHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = (req.query.search as string) || "";
    const createdAt = req.query.createdAt as string;
    const endAt = req.query.endAt as string;
    const offset = (page - 1) * limit;
    const dir = (req.query.order as any) || "";
    const field = (req.query.field as string) || "";

    const WorkReportCount = await inspectionHistoryRepository.count({
      where: { user_id: userId },
    });

    if (WorkReportCount === 0) {
      return res.status(200).send({
        status: 200,
        message:
          "No inspection work report history found for the logged-in user.",
        data: [],
      });
    }

    const query = inspectionHistoryRepository
      .createQueryBuilder("inspectionHistory")
      .where("inspectionHistory.user_id = :userId", { userId });
    if (searchQuery) {
      query.andWhere(
        `(${[
          "wr_no",
          "chapter_section_subject",
          "ata_title",
          "task_number",
          "task_title",
          "description",
          "mpn",
          "pn",
          "ref_manual",
          "documentation",
          "sub_task",
          "signature",
          "additional_control",
          "notes_measurements",
          "inspection_date",
          "next_date_exp",
          "insp_hours",
          "next_hours_exp",
          "insp_cycles",
          "next_cycles_exp",
          "inspection_requested_date",
          "created_at",
        ]
          .map((field) => `inspectionHistory.${field} LIKE :searchQuery`)
          .join(" OR ")})`,
        { searchQuery: `%${searchQuery}%` }
      );
    }

    if (createdAt && endAt) {
      query.andWhere("inspectionHistory.created_at BETWEEN :start AND :end", {
        start: new Date(createdAt),
        end: new Date(endAt),
      });
    } else if (createdAt) {
      query.andWhere("inspectionHistory.created_at >= :start", {
        start: new Date(createdAt),
      });
    } else if (endAt) {
      query.andWhere("inspectionHistory.created_at <= :end", {
        end: new Date(endAt),
      });
    }

    if (field.length > 0 && dir.length > 0) {
      query
        .addOrderBy(`inspectionHistory.${field}`, dir.toUpperCase())
        .skip(offset)
        .take(limit);
    } else {
      query
        .orderBy("inspectionHistory.created_at", "DESC")
        .skip(offset)
        .take(limit);
    }

    const [inspectionHistory, total] = await query.getManyAndCount();

    if (inspectionHistory.length === 0) {
      return res.status(200).send({
        status: 200,
        message:
          "No inspection work report history found matching the provided search.",
        data: [],
      });
    }
    res.status(201).json({
      status: 201,
      message: "inspection Work report history retrieved successfully",
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: inspectionHistory,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error fetching inspection work report history",
      error,
    });
  }
};

export const inspectionEvaluation = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = (req.query.search as string) || "";
    const createdAt = req.query.createdAt as string;
    const endAt = req.query.endAt as string;
    const offset = (page - 1) * limit;
    const dir = (req.query.order as any) || "";
    const field = (req.query.field as string) || "";

    const inspectionEvaluationCount =
      await inspectionEvaluationRepository.count({
        where: { user_id: userId },
      });

    if (inspectionEvaluationCount === 0) {
      return res.status(200).send({
        status: 200,
        message:
          "No inspection work report history found for the logged-in user.",
        data: [],
      });
    }
    const query = inspectionEvaluationRepository
      .createQueryBuilder("inspectionEvaluation")
      // .leftJoinAndSelect("inspectionEvaluation.inspections", "inspections")
      .where("inspectionEvaluation.user_id = :userId", { userId });
    if (searchQuery) {
      query.andWhere(
        `(${[
          "wr_no",
          "aircraft_type",
          "revision",
          "revision_date",
          "atachapter",
          "chapter_section_subject",
          "ata_title",
          "task_number",
          "task_title",
          "modes",
          "climatic_condition",
          "description",
          "mpn",
          "pn",
          "maintenance_mode",
          "frequency",
          "limit_1",
          "unit_1",
          "margin_1",
          "margin_unit_1",
          "limit_2",
          "unit_2",
          "margin_2",
          "margin_unit_2",
          "limit_3",
          "unit_3",
          "margin_3",
          "margin_unit_3",
          "ref_manual",
          "documentation",
          "cycle_type",
          "i_key",
          "applicable",
          "motivation",
          "insp_cycles",
        ]
          .map((field) => `inspectionEvaluation.${field} LIKE :searchQuery`)
          .join(" OR ")})`,
        { searchQuery: `%${searchQuery}%` }
      );
    }

    if (createdAt && endAt) {
      query.andWhere(
        "inspectionEvaluation.created_at BETWEEN :start AND :end",
        {
          start: new Date(createdAt),
          end: new Date(endAt),
        }
      );
    } else if (createdAt) {
      query.andWhere("inspectionEvaluation.created_at >= :start", {
        start: new Date(createdAt),
      });
    } else if (endAt) {
      query.andWhere("inspectionEvaluation.created_at <= :end", {
        end: new Date(endAt),
      });
    }

    if (field.length > 0 && dir.length > 0) {
      query
        .addOrderBy(`inspectionEvaluation.${field}`, dir.toUpperCase())
        .skip(offset)
        .take(limit);
    } else {
      query
        .orderBy("inspectionEvaluation.created_at", "DESC")
        .skip(offset)
        .take(limit);
    }

    const [inspectionEvaluation, total] = await query.getManyAndCount();

    if (inspectionEvaluation.length === 0) {
      return res.status(200).send({
        status: 200,
        message: "No inspection evaluation found matching the provided search.",
        data: [],
      });
    }
    res.status(201).json({
      status: 201,
      message: "inspection evaluation retrieved successfully",
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: inspectionEvaluation,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error fetching inspection evaluation",
      error,
    });
  }
};

export const inspectionDeadlineData = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = (req.query.search as string) || "";
    const offset = (page - 1) * limit;
    const aircraftIds = req.query.id
      ? (Array.isArray(req.query.id)
          ? req.query.id
          : (req.query.id as string).split(",")
        ).map(Number)
      : [];
    const user = await userRepository.findOne({
      where: { id: parseInt(userId) },
      relations: ["organization"],
    });

    const org_id = user.organization.id;

    const query = inspectionEvaluationRepository
      .createQueryBuilder("inspectionEvaluation")
      .leftJoinAndSelect("inspectionEvaluation.inspections", "inspections")
      .leftJoinAndSelect("inspectionEvaluation.aircraft", "aircraft")
      .where("inspections.organizationId = :org_id", { org_id });
    // .where("inspectionEvaluation.user_id = :userId", { userId });

    if (aircraftIds.length > 0) {
      query.andWhere("inspectionEvaluation.aircraftId IN (:...aircraftIds)", {
        aircraftIds,
      });
    }
    if (searchQuery) {
      query.andWhere(
        `(${[
          "wr_no",
          "aircraft_type",
          "revision",
          "revision_date",
          "atachapter",
          "chapter_section_subject",
          "ata_title",
          "task_number",
          "task_title",
          "modes",
          "climatic_condition",
          "description",
          "mpn",
          "pn",
          "maintenance_mode",
          "frequency",
          "limit_1",
          "unit_1",
          "margin_1",
          "margin_unit_1",
          "limit_2",
          "unit_2",
          "margin_2",
          "margin_unit_2",
          "limit_3",
          "unit_3",
          "margin_3",
          "margin_unit_3",
          "ref_manual",
          "documentation",
          "cycle_type",
          "i_key",
          "applicable",
          "motivation",
          "inspection_date",
          "next_date_exp",
          "insp_hours",
          "next_hours_exp",
          "insp_cycles",
          "next_cycles_exp",
        ]
          .map((field) => `inspectionEvaluation.${field} LIKE :searchQuery`)
          .join(" OR ")})`,
        { searchQuery: `%${searchQuery}%` }
      );
    }

    query
      .orderBy("inspectionEvaluation.created_at", "DESC")
      .skip(offset)
      .take(limit);
    const [inspectionEvaluation, total] = await query.getManyAndCount();

    const changedResponse = inspectionEvaluation.map((item: any) => {
      const today = new Date();
      const nextDateExp = item.next_date_exp
        ? new Date(item.next_date_exp)
        : null;
      let remaining_days = null;
      if (nextDateExp) {
        const timeDiff = nextDateExp.getTime() - today.getTime();
        remaining_days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      }
      return {
        ...item,
        inspection_type: item.inspections.cycle_type,
        aircraft_registration_mark: item.aircraft.registrationMark,
        remaining_days,
      };
    });

    return res.status(201).json({
      status: 201,
      message: "inspection deadline data retrieved successfully",
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: changedResponse,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 500,
      message: "Error fetching inspection evaluation",
      error,
    });
  }
};

export const inspectionUpdate = async (req: Request, res: Response) => {
  try {
    const { inspections, markdown, applicable, next_date_exp } = req.body.data;
    const userId = req.user.userId;
    let wrNo = "WR_01";

    const lastWorkHistory = await inspectionEvaluationRepository
      .createQueryBuilder("work_report")
      .orderBy("work_report.id", "DESC")
      .getOne();

    if (lastWorkHistory?.wr_no) {
      const lastNumber = parseInt(lastWorkHistory.wr_no.split("_")[1], 10) || 0;
      const nextNumber = lastNumber + 1;
      wrNo = `WR_${String(nextNumber).padStart(2, "0")}`;
    }
    const inspectionData: any = inspections.map((record: any) => ({
      user_id: userId,
      wr_no: wrNo,
      organizationId: record.organizationId,
      aircraftId: record.aircraftId,
      inspection_id: record.id,
      aircraft_type: record.aircraft_type,
      revision: record.revision,
      revision_date: record.revision_date,
      atachapter: record.atachapter,
      chapter_section_subject: record.chapter_section_subject,
      ata_title: record.ata_title,
      task_number: record.task_number,
      task_title: record.task_title,
      modes: record.modes,
      climatic_condition: record.climatic_condition,
      description: record.description,
      mpn: record.mpn,
      pn: record.pn,
      maintenance_mode: record.maintenance_mode,
      frequency: record.frequency,
      limit_1: record.limit_1,
      unit_1: record.unit_1,
      margin_1: record.margin_1,
      margin_unit_1: record.margin_unit_1,
      limit_2: record.limit_2,
      unit_2: record.unit_2,
      margin_2: record.margin_2,
      margin_unit_2: record.margin_unit_2,
      limit_3: record.limit_3,
      unit_3: record.unit_3,
      margin_3: record.margin_3,
      margin_unit_3: record.margin_unit_3,
      ref_manual: record.ref_manual,
      documentation: record.documentation,
      cycle_type: record.cycle_type,
      i_key: record.i_key,
      applicable: applicable,
      motivation: markdown,
      next_hours_exp: record.updated_hours,
      next_cycles_exp: record.updated_cycles,
      insp_cycles: record.airframeCycles,
      next_date_exp: next_date_exp,
    }));
    const savedInspectionsEvaluation =
      await inspectionEvaluationRepository.save(inspectionData);
    for (const inspection of inspections) {
      await inspectionRepository.update(
        { id: inspection.id },
        {
          applicable: applicable,
          motivation: markdown,
          //  work_report: work_report,
        }
      );
    }
    return res.status(201).json({
      status: 201,
      message: "Inspection updated successfully",
      data: savedInspectionsEvaluation,
    });
  } catch (error: any) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

export const closeWorkReport = async (req: Request, res: Response) => {
  try {
    const { workReportData, inspection_date } = req.body;
    const userId = req.user.userId;

    if (!workReportData || workReportData.length === 0 || !inspection_date) {
      return res.status(400).json({
        status: 400,
        message: "Work report data and inspection date are required.",
      });
    }
    const selectedDate = new Date(inspection_date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        status: 400,
        message: "Invalid inspection date format.",
      });
    }

    const wrNo = workReportData[0].wr_no;
    const matchingInspections = workReportData.filter(
      (entry: any) => entry.wr_no === wrNo
    );
    const inspectionIds = workReportData.map((entry: any) => entry.id);
    const update = [];
    for (const entry of workReportData) {
      const updateResult = await inspectionRepository.update(
        { id: entry.id },
        {
          i_status: "done",
          exp_date_close: selectedDate,
          exp_hours_close: entry.updated_hours,
          exp_cycles_close: entry.updated_cycles,
        }
      );
      update.push(updateResult);
    }
    const reportsToSave = matchingInspections.map((entry: any) => {
      const record = new InspectionsWorkReports();
      record.id = entry.work_report_id;
      record.user_id = userId;
      record.aircraftId = entry.aircraftId;
      record.inspection_id = entry.id;
      record.wr_no = entry.wr_no;
      record.chapter_section_subject = entry.chapter_section_subject;
      record.ata_title = entry.ata_title;
      record.task_number = entry.task_number;
      record.task_title = entry.task_title;
      record.description = entry.description;
      record.mpn = entry.mpn;
      record.pn = entry.pn;
      record.ref_manual = entry.ref_manual;
      record.documentation = entry.documentation;
      record.sub_task = entry.mpn;
      record.inspection_date = entry.inspection_date;
      record.inspection_requested_date = entry.inspection_requested_date
        ? new Date(entry.inspection_requested_date)
        : null;
      return record;
    });
    const updateResults = [];

    for (const report of reportsToSave) {
      const logUpdate = await inspectionHistoryRepository.update(
        { id: report.id },
        {
          user_id: report.user_id,
          aircraftId: report.aircraftId,
          wr_no: report.wr_no,
          chapter_section_subject: report.chapter_section_subject,
          ata_title: report.ata_title,
          task_number: report.task_number,
          task_title: report.task_title,
          description: report.description,
          mpn: report.mpn,
          pn: report.pn,
          ref_manual: report.ref_manual,
          documentation: report.documentation,
          sub_task: report.sub_task,
          inspection_date: selectedDate,
          inspection_requested_date: report.inspection_requested_date,
        }
      );
      updateResults.push(logUpdate);
    }

    return res.status(201).json({
      status: 201,
      message: `Successfully Close work reports.`,
      data: updateResults,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Failed to generate work report.",
      error: error.message,
    });
  }
};
