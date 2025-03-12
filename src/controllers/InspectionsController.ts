import { Request, Response } from "express";
import { AppDataSource } from "../index";
import { Inspection } from "../models/InspectionsModel";
import { InspectionHistory } from "../models/InspectionsWorkReportModel";
import * as XLSX from "xlsx";
import multer = require("multer");
import { Users } from "../models/UsersModel";

const inspectionRepository = AppDataSource.getRepository(Inspection);
const inspectionHistoryRepository =
  AppDataSource.getRepository(InspectionHistory);
const userRepository = AppDataSource.getRepository(Users);

const upload = multer({ dest: "uploads/" });
export const uploadInspectionExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded!");
    }
    const body = JSON.parse(JSON.stringify(req.body));
    const aircraftsId = body.aircrafts_id;
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
    const inspectionData: any[] = [];
    const formatDateTime = (excelDate: any) => {
      if (!excelDate) return null;
      const excelEpoch = new Date(1899, 11, 30);
      const milliseconds = excelDate * 24 * 60 * 60 * 1000;
      const date = new Date(excelEpoch.getTime() + milliseconds);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    for (const record of data) {
      const createInspection = {
        user_id: userId,
        aircraft_type: record["Aircraft Type"],
        revision: record.Revision,
        revision_date: formatDateTime(record["Revision Date"]),
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
        frequency: record.Frequency,
        limit_1: record["Limit 1"],
        unit_1: record["Unit 1"],
        margin_1: record["Margin 1"],
        margin_unit_1: record["Margin Unit 1"],
        limit_2: record["Limit 2"],
        unit_2: record["Unit 2"],
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
    const inspectionDatas = inspectionData.map((item: any) => {
      return {
        ...item,
        org_id: parseInt(req.body.orgId),
        aircraft_id: aircraftsId,
      };
    });

    const technicalSave = await inspectionRepository.save(inspectionDatas);
    res.status(200).send({
      status: 200,
      message: "Excel data has been successfully saved to the database.",
      data: technicalSave,
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
    const offset = (page - 1) * limit;

const aircraftId = req.query.aircraftId
  ? parseInt(req.query.aircraftId as string)
  : null;

const databaseId = req.query.readonlyvar === "true";

const user = await userRepository.findOne({
  where: { id: parseInt(userId) },
  relations: ["organization"],
});

   const org_id = user.organization.id;

  const userinspectionCount = await inspectionRepository.count({
      where: { org_id: user.organization.id },
    });

    if (userinspectionCount === 0) {
      return res.status(200).send({
        status: 200,
        message: "No inspection found for the logged-in user.",
        data: [],
      });
    }

    const query = inspectionRepository
      .createQueryBuilder("inspectionWork")
      .where("inspectionWork.org_id = :org_id", { org_id });

      if (!databaseId && aircraftId) {
        query.andWhere("inspectionWork.aircraft_id = :aircraftId", {
          aircraftId,
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
          "i_key"
        ]
          .map((field) => `inspectionWork.${field} LIKE :searchQuery`)
          .join(" OR ")})`,
        { searchQuery: `%${searchQuery}%` }
      );
    }

    query.orderBy("inspectionWork.created_at", "DESC").skip(offset).take(limit);

    const [inspectionWorkReport, total] = await query.getManyAndCount();

    if (inspectionWorkReport.length === 0) {
      return res.status(200).send({
        status: 200,
        message:
          "No inspection  found matching the provided filters.",
        data: [],
      });
    }

    return res.status(200).send({
      status: 200,
      message: "inspection  retrieved successfully.",
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
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

export const inspectionWorkReport = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.userId;

    if (!user_id) {
      return res.status(400).json({ status: 400, message: "Invalid user ID" });
    }
    let reports: any[] = req.body;
    if (!Array.isArray(reports)) {
      reports = [reports];
    }

    const user = await userRepository.findOne({
      where: { id: user_id },
    });

    if (!user) {
      return res
        .status(401)
        .json({ status: 401, message: "Unauthenticated user" });
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

    const newInspectionWorkReport = reports.map((report: any) => {
      return {
        user_id: user_id,
        aircraft_id: report.aircraftId,
        wr_no: workNo,
        title: report?.title,
        wr_date: report?.wr_date,
        remaining_days: report?.remaining_days,
        remaining_hours: report?.remaining_hours,
        remaining_cycles: report?.remaining_cycles,
        expiry_date: report?.expiry_date,
        last_date: report?.last_date,
        work_report: report?.work_report,
        signature: Object.prototype.hasOwnProperty.call(report, "signature")
          ? report.signature
          : "",
        additional_control: Object.prototype.hasOwnProperty.call(
          report,
          "additional_control"
        )
          ? report.additional_control
          : "",
        notes_measurements: Object.prototype.hasOwnProperty.call(
          report,
          "notes_measurements"
        )
          ? report.notes_measurements
          : "",
      };
    });

    await inspectionHistoryRepository.save(newInspectionWorkReport);

    return res.status(201).json({
      status: 201,
      message: `${newInspectionWorkReport.length} inspection work reports added successfully`,
      data: newInspectionWorkReport,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error while adding inspection work report",
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
          "title",
          "wr_date",
          "remaining_days",
          "remaining_hours",
          "remaining_cycles",
          "expiry_date",
          "last_date",
          "work_report",
          "signature",
          "additional_control",
          "notes_measurements",
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

    query
      .orderBy("inspectionHistory.created_at", "DESC")
      .skip(offset)
      .take(limit);
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
