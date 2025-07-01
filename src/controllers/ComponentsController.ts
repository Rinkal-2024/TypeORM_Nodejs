import { Request, Response } from "express";
import { AppDataSource } from "../index";
import * as XLSX from "xlsx";
import multer = require("multer");
import { Users } from "../models/Users";
import { Components } from "../models/Components";
import { In } from "typeorm";
import { ComponentsEvaluations } from "../models/ComponentsEvaluations";
import { Aircrafts } from "../models/Aircrafts";

const componentsRepository = AppDataSource.getRepository(Components);
const userRepository = AppDataSource.getRepository(Users);
const componentsEvaluationRepository = AppDataSource.getRepository(
  ComponentsEvaluations
);
const aircraftRepository = AppDataSource.getRepository(Aircrafts);
const upload = multer({ dest: "uploads/" });
export const uploadComponentsExcel = async (req: Request, res: Response) => {
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
    const componentsData: any[] = [];
    for (const record of keepData) {
      const createComponents = {
        user_id: userId,
        aircraft_type: record["Aircraft Type"],
        revision: record.Revision,
        revision_date: record["Revision Date"],
        atachapter: record.ATAChapter,
        chapter_section_subject: record["Chapter Section Subject"],
        ata_title: record["ATA Title"],
        task_number: record["Task number"],
        task_title: record["Task Title"],
        modes: record.MOD,
        climatic_condition: record["Climatic Condition"],
        description: record.Description,
        mpn: record.MPN,
        pn: record.PN,
        maintenance_mode: record["Maintenance Mode"],
        frequency: record.Frequency,
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
        c_key: record.KEY,
        cycle_type: record["CYCLE TYPE"],
      };
      componentsData.push(createComponents);
    }
    const dataTosave = aircraftsFromDb.map((ik: any) => {
      const componentsDatas = componentsData.map((item: any) => {
        return {
          ...item,
          organizationId: parseInt(req.body.orgId),
          // aircraft_type: ik.aircraft_type,
          aircraftId: ik.id,
        };
      });
      return componentsDatas;
    });
    const inspectionSave = await componentsRepository.save(dataTosave.flat(2));
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

export const getComponentsData = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = (req.query.search as string) || "";
    const typeFilter = (req.query.type as string) || "";
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

    const usercomponentsCount = await componentsRepository.count({
      where: { organizationId: user.organization.id },
    });

    if (usercomponentsCount === 0) {
      return res.status(200).send({
        status: 200,
        message: "No components found for the logged-in user.",
        data: [],
      });
    }

    const query = componentsRepository
      .createQueryBuilder("com")
      .select([
        "com.id AS id",
        "com.user_id AS user_id",
        "com.aircraftId AS aircraftId",
        "com.applicable AS applicable",
        "com.motivation AS motivation",
        "com.organizationId AS organizationId",
        "com.aircraft_type AS aircraft_type",
        "com.revision AS revision",
        "com.revision_date AS revision_date",
        "com.atachapter AS atachapter",
        "com.chapter_section_subject AS chapter_section_subject",
        "com.ata_title AS ata_title",
        "com.task_number AS task_number",
        "com.task_title AS task_title",
        "com.modes AS modes",
        "com.climatic_condition AS climatic_condition",
        "com.description AS description",
        "com.mpn AS mpn",
        "com.pn AS pn",
        "com.maintenance_mode AS maintenance_mode",
        "com.frequency AS frequency",
        "com.limit_1 AS limit_1",
        "com.unit_1 AS unit_1",
        "com.margin_1 AS margin_1",
        "com.margin_unit_1 AS margin_unit_1",
        "com.limit_2 AS limit_2",
        "com.unit_2 AS unit_2",
        "com.margin_2 AS margin_2",
        "com.margin_unit_2 AS margin_unit_2",
        "com.limit_3 AS limit_3",
        "com.unit_3 AS unit_3",
        "com.margin_3 AS margin_3",
        "com.margin_unit_3 AS margin_unit_3",
        "com.documentation AS documentation",
        "com.cycle_type AS cycle_type",
        "com.ref_manual AS ref_manual",
        "com.c_key AS c_key",
        "com.status AS status",
        "com.deleted_at AS deleted_at",
        "com.created_at AS created_at",
        "com.updated_at AS updated_at",
        "aircraft.airframeHours AS airframeHours",
        "aircraft.expiredAt AS expiredAt",
        "DATE(TIMESTAMPADD(DAY, COALESCE(CAST(com.limit_2 AS SIGNED), 0), NOW())) AS total_days_time",
        // "TIMESTAMPDIFF(DAY, NOW(), TIMESTAMPADD(DAY, COALESCE(CAST(com.limit_2 AS SIGNED), 0), NOW())) AS remaining_days",
        // "DATEDIFF(TIMESTAMPADD(DAY, COALESCE(CAST(com.limit_2 AS SIGNED), 0), NOW()), NOW()) AS days_tolerance",
        "CASE WHEN com.applicable = 'Yes' THEN NULLIF (DATEDIFF(TIMESTAMPADD(DAY, COALESCE(CASE com.margin_unit_2 WHEN 'D' THEN CAST(com.Margin_2 AS SIGNED) WHEN 'M' THEN CAST(com.Margin_2 AS SIGNED) * 30 WHEN 'Y' THEN CAST(com.Margin_2 AS SIGNED) * 365 ELSE 0 END, 0) + (SELECT rem_days FROM c_evaluation_histories WHERE component_id = com.id ORDER BY rem_days DESC LIMIT 1), NOW()), NOW()) ,0)ELSE NULL END AS days_tolerance",
        `SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) AS airframe_hours_only_hours`,
        `SUBSTRING_INDEX(SUBSTRING_INDEX(aircraft.airframeHours, ':', -1), ' ', 1) AS airframe_hours_only_minutes`,
        // `FLOOR((SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) + COALESCE(CAST(com.limit_1 AS SIGNED), 0)) - SUBSTRING_INDEX(aircraft.airframeHours, ':', 1)) AS remaining_hours`,
        `LPAD(FLOOR(((TIME_TO_SEC(aircraft.airframeHours) % 3600) / 60) + COALESCE(CAST(com.limit_1 AS SIGNED), 0)), 2, '0') AS remaining_minutes`,
        `CASE WHEN com.applicable = 'Yes' THEN  DATE_ADD((SELECT exp_date FROM c_evaluation_histories WHERE component_id = com.id ORDER BY exp_date DESC LIMIT 1),
         INTERVAL CASE com.margin_unit_2 WHEN 'D' THEN com.margin_2 WHEN 'M' THEN com.margin_2 * 30 WHEN 'Y' THEN com.margin_2 * 365 ELSE 0 END DAY) ELSE NULL END AS expiration_tolerance`,
        // `CASE WHEN com.applicable = 'Yes' THEN DATE_ADD(TIMESTAMPADD(DAY, COALESCE(CAST(com.limit_2 AS SIGNED), 0), NOW()), INTERVAL COALESCE(CAST(com.limit_2 AS SIGNED), 0) DAY)ELSE NULL END AS expiration_tolerance`,
        `DATE_FORMAT(DATE_ADD(TIMESTAMPADD(DAY, COALESCE(CAST(com.limit_2 AS SIGNED), 0), NOW()), INTERVAL COALESCE(CAST(com.limit_2 AS SIGNED), 0) DAY), '%Y-%m-%d') AS expiration_tolerance_formatted`,
        // `DATE_FORMAT(TIMESTAMPADD(DAY, COALESCE(CAST(com.limit_2 AS SIGNED), 0), NOW()), '%Y-%m-%d') AS expiry_date`,
        // `(COALESCE(CAST(SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) AS SIGNED),0) + FLOOR((SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) + COALESCE(CAST(com.limit_1 AS SIGNED), 0)) - SUBSTRING_INDEX(aircraft.airframeHours, ':', 1))) AS landing_by_the_hours`,
        // `CONCAT(LPAD(FLOOR(TIMESTAMPDIFF(MINUTE, NOW(), TIMESTAMPADD(DAY, COALESCE(CAST(com.limit_2 AS SIGNED), 0), NOW())) / 60), 2, '0'), ':', LPAD(TIMESTAMPDIFF(MINUTE, NOW(), TIMESTAMPADD(DAY, COALESCE(CAST(com.limit_2 AS SIGNED), 0), NOW())) % 60, 2, '0')) AS landing_by_the_hours`,
        `CASE WHEN com.applicable = 'Yes' THEN (SELECT exp_date  FROM c_evaluation_histories WHERE component_id = com.id ORDER BY exp_date DESC LIMIT 1) ELSE NULL END AS expiry_date`,
        `CASE WHEN com.applicable = 'Yes' THEN (SELECT exp_hours FROM c_evaluation_histories WHERE component_id = com.id ORDER BY exp_hours DESC LIMIT 1)ELSE NULL END AS exp_hours`,
        `CASE WHEN com.applicable = 'Yes' THEN (SELECT exp_cycles FROM c_evaluation_histories WHERE component_id = com.id ORDER BY exp_cycles DESC LIMIT 1)ELSE NULL END AS exp_cycles`,
        // `(SELECT rem_days FROM  c_evaluation_histories WHERE component_id = com.id ORDER BY rem_days DESC LIMIT 1) AS rem_days`,
        `CASE WHEN com.applicable = 'Yes' THEN NULLIF((SELECT rem_days FROM c_evaluation_histories WHERE component_id = com.id ORDER BY rem_days DESC LIMIT 1),0) ELSE NULL END AS rem_days`,
        `CASE WHEN com.applicable = 'Yes' THEN (SELECT rem_hours FROM c_evaluation_histories WHERE component_id = com.id ORDER BY rem_hours DESC LIMIT 1) ELSE NULL END AS rem_hours`,
        `CASE WHEN com.applicable = 'Yes' THEN NULLIF((SELECT rem_cycles FROM c_evaluation_histories WHERE component_id = com.id ORDER BY rem_cycles DESC LIMIT 1), 0) ELSE NULL END AS rem_cycles`,
        `CASE WHEN com.applicable = 'Yes' THEN CONCAT((CAST(SUBSTRING_INDEX((SELECT rem_hours FROM c_evaluation_histories WHERE component_id = com.id ORDER BY rem_hours DESC LIMIT 1), ':', 1) AS UNSIGNED) + COALESCE(CAST(com.margin_1 AS UNSIGNED), 0)), ':', LPAD(SUBSTRING_INDEX((SELECT rem_hours FROM c_evaluation_histories WHERE component_id = com.id ORDER BY rem_hours DESC LIMIT 1), ':', -1), 2, '0')) ELSE NULL END AS hours_tolerance`,
        // `(rem_hours + SUBSTRING_INDEX(aircraft.airframeHours, ':', 1)) AS landing_by_the_hours`,
        `CASE WHEN com.applicable = 'Yes' THEN((SELECT rem_hours FROM c_evaluation_histories WHERE component_id = com.id ORDER BY rem_hours DESC LIMIT 1)
          + SUBSTRING_INDEX(aircraft.airframeHours, ':', 1) ) ELSE NULL END AS landing_by_the_hours`,
        `CASE WHEN com.applicable = 'Yes' THEN (( (SELECT rem_hours FROM c_evaluation_histories WHERE component_id = com.id ORDER BY rem_hours DESC  LIMIT 1 )  + SUBSTRING_INDEX(aircraft.airframeHours, ':', 1))  + com.limit_1 )ELSE NULL END AS landing_by_the_hours_toll`,
        `CASE WHEN com.applicable = 'Yes' THEN ((SELECT rem_cycles FROM c_evaluation_histories WHERE component_id = com.id ORDER BY rem_cycles DESC LIMIT 1) + COALESCE(CAST(com.margin_3 AS SIGNED), 0)) ELSE NULL END AS cycle_toll`,
      ])
      .leftJoin("com.aircraft", "aircraft")
      .leftJoin("com.componentsEvaluations", "c_evaluation_histories")
      .where("com.organizationId = :org_id", { org_id });

    if (databaseId === true) {
      query.andWhere("com.organizationId = :org_id", { org_id });
      if (aircraftTypeId === false) {
        query.andWhere("com.aircraftId = :aircraftId", {
          aircraftId,
        });
      }
    }

    if (databaseId === false) {
      query.andWhere("com.aircraftId = :aircraftId", {
        aircraftId,
      });
    }
    if (typeFilter) {
      if (typeFilter === "x") {
        query.andWhere("com.applicable IS NULL");
      } else {
        query.andWhere("com.applicable = :typeFilter", {
          typeFilter,
        });
      }
    }

    if (searchQuery) {
      query.andWhere(
        `(${[
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
          "c_key",
        ]
          .map((field) => `com.${field} LIKE :searchQuery`)
          .join(" OR ")})`,
        { searchQuery: `%${searchQuery}%` }
      );
    }

    if (databaseId === true) {
      query.addGroupBy(`com.id,com.organizationId`);
      if (aircraftTypeId === false) {
        query.addGroupBy(`com.id,com.aircraftId,com.organizationId`);
      }
    }

    if (databaseId === false) {
      query.addGroupBy(`com.id,com.aircraftId,com.organizationId`);
    }

    if (field.length > 0 && dir.length > 0) {
      query.addOrderBy(field, dir.toUpperCase()).skip(offset).limit(limit);
    } else {
      query.addOrderBy("com.created_at", "DESC").offset(offset).limit(limit);
    }
    const componentsData = await query.getRawMany();

    const totalCountQuery = AppDataSource.getRepository(Components)
      .createQueryBuilder("com")
      .select("COUNT(*) AS totalCount")
      .leftJoin("com.aircraft", "aircraft");
    // .where("com.organizationId = :org_id", { org_id });

    if (databaseId === true) {
      totalCountQuery.andWhere("com.organizationId = :org_id", {
        org_id,
      });
      if (aircraftTypeId === false) {
        totalCountQuery.andWhere("com.aircraftId = :aircraftId", {
          aircraftId,
        });
      }
    }

    if (databaseId === false) {
      totalCountQuery.andWhere("com.aircraftId = :aircraftId", {
        aircraftId,
      });
    }
    if (typeFilter) {
      if (typeFilter === "x") {
        totalCountQuery.andWhere("com.applicable IS NULL");
      } else {
        totalCountQuery.andWhere("com.applicable = :typeFilter", {
          typeFilter,
        });
      }
    }
    if (searchQuery) {
      totalCountQuery.andWhere(
        `(${[
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
          "c_key",
        ]
          .map((field) => `com.${field} LIKE :searchQuery`)
          .join(" OR ")})`,
        { searchQuery: `%${searchQuery}%` }
      );
    }

    const totalResult = await totalCountQuery.getRawOne();
    const totalRecords = parseInt(totalResult?.totalCount || "0", 10);

    return res.status(200).send({
      status: 200,
      message: "components retrieved successfully.",
      page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords: totalRecords,
      data: componentsData,
    });
  } catch (error) {
    console.log("error", error);

    return res.status(500).send({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const getComponentsDeadlineData = async (
  req: Request,
  res: Response
) => {
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

    const usercomponentsCount = await componentsRepository.count({
      where: { organizationId: user.organization.id },
    });

    if (usercomponentsCount === 0) {
      return res.status(200).send({
        status: 200,
        message: "No components found for the logged-in user.",
        data: [],
      });
    }

    const query = componentsEvaluationRepository
      .createQueryBuilder("com")
      .leftJoinAndSelect("com.aircraft", "aircraft")
      .leftJoinAndSelect("com.components", "components")
      .where("components.organizationId = :org_id", { org_id });
      // .where("com.user_id = :userId", { userId });

    if (aircraftIds.length > 0) {
      query.andWhere("com.aircraftId IN (:...aircraftIds)", {
        aircraftIds,
      });
    }
    if (searchQuery) {
      query.andWhere(
        `(${[
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
          "c_key",
        ]
          .map((field) => `com.${field} LIKE :searchQuery`)
          .join(" OR ")})`,
        { searchQuery: `%${searchQuery}%` }
      );
    }

    query.orderBy("com.created_at", "DESC").skip(offset).take(limit);

    const [componentsData, total] = await query.getManyAndCount();

    const changedResponse = componentsData.map((item: any) => {
      return {
        ...item,
        aircraft_registration_mark: item.aircraft.registrationMark,
      };
    });

    if (componentsData.length === 0) {
      return res.status(200).send({
        status: 200,
        message: "No components found matching the provided filters.",
        data: [],
      });
    }

    return res.status(200).send({
      status: 200,
      message: "components deadline data retrieved successfully.",
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: changedResponse,
    });
  } catch (error) {
    console.log("error", error);

    return res.status(500).send({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const componentEvaluation = async (req: Request, res: Response) => {
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

    const componentEvaluationCount = await componentsEvaluationRepository.count(
      {
        where: { user_id: userId },
      }
    );

    if (componentEvaluationCount === 0) {
      return res.status(200).send({
        status: 200,
        message:
          "No components evaluation history found for the logged-in user.",
        data: [],
      });
    }
    const query = componentsEvaluationRepository
      .createQueryBuilder("componentsEvaluation")
      .leftJoinAndSelect("componentsEvaluation.components", "components")
      .where("componentsEvaluation.user_id = :userId", { userId });
    if (searchQuery) {
      query.andWhere(
        `(${["cycle_type", "c_key", "applicable", "motivation"]
          .map((field) => `componentsEvaluation.${field} LIKE :searchQuery`)
          .join(" OR ")})`,
        { searchQuery: `%${searchQuery}%` }
      );
    }

    if (createdAt && endAt) {
      query.andWhere(
        "componentsEvaluation.created_at BETWEEN :start AND :end",
        {
          start: new Date(createdAt),
          end: new Date(endAt),
        }
      );
    } else if (createdAt) {
      query.andWhere("componentsEvaluation.created_at >= :start", {
        start: new Date(createdAt),
      });
    } else if (endAt) {
      query.andWhere("componentsEvaluation.created_at <= :end", {
        end: new Date(endAt),
      });
    }

    if (field.length > 0 && dir.length > 0) {
      query
        .addOrderBy(`componentsEvaluation.${field}`, dir.toUpperCase())
        .skip(offset)
        .take(limit);
    } else {
      query
        .orderBy("componentsEvaluation.created_at", "DESC")
        .skip(offset)
        .take(limit);
    }

    const [componentEvaluation, total] = await query.getManyAndCount();

    if (componentEvaluation.length === 0) {
      return res.status(200).send({
        status: 200,
        message: "No component evaluation found matching the provided search.",
        data: [],
      });
    }
    res.status(201).json({
      status: 201,
      message: "component evaluation retrieved successfully",
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: componentEvaluation,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error fetching component evaluation",
      error,
    });
  }
};

export const insertcomponentEvaluation = async (
  req: Request,
  res: Response
) => {
  try {
    const { components, applicable, markdown } = req.body.data;
    const user_id = req.user.userId;
    if (!user_id) {
      return res.status(400).json({ status: 400, message: "Invalid user ID" });
    }

    if (!Array.isArray(components)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid components data. Expected an array.",
      });
    }

    const componentsData: any = components.map((record: any) => ({
      user_id: user_id,
      organizationId: record.organizationId,
      aircraftId: record.aircraftId,
      component_id: record.id,
      cycle_type: record.cycle_type,
      c_key: record.c_key,
      applicable: applicable,
      motivation: markdown,
      exp_date: record.expDate,
      exp_hours: record.exphours,
      exp_cycles: record.expCycles,
      rem_days: record.RemDays,
      rem_hours: record.RemHours,
      rem_cycles: record.RemCycles,
    }));

    const savedComponentEvaluation = await componentsEvaluationRepository.save(
      componentsData
    );
    for (const record of components) {
      await componentsRepository.update(
        { id: record.id },
        {
          applicable: applicable,
          motivation: markdown,
        }
      );
    }
    return res.status(201).json({
      status: 201,
      message: `Evaluation added successfully`,
      componentsData: savedComponentEvaluation,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error while inserting data.",
      error: error.message,
    });
  }
};
