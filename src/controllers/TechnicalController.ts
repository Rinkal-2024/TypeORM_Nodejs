import { Request, Response } from "express";
import { AppDataSource } from "../index";
import * as XLSX from "xlsx";
import multer = require("multer");
import { TechnicalBulletins } from "../models/TechnicalBulletinsModel";
import { Users } from "../models/UsersModel";
import { EvaluationHistory } from "../models/ EvaluationsHistoryModel";
import { WorkReport } from "../models/WorkReportsModel";
import moment = require("moment");

const excelRepository = AppDataSource.getRepository(TechnicalBulletins);
const userRepository = AppDataSource.getRepository(Users);
const evaluationRepository = AppDataSource.getRepository(EvaluationHistory);
const workRepository = AppDataSource.getRepository(WorkReport);

const upload = multer({ dest: "uploads/" });
export const uploadExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded!");
    }
    const dataBody = req.body;

    const aircraftData = JSON.parse(req.body.aircrafts);
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
    const technicalBulletinsData: any[] = [];

    const formatDate = (excelDate: any, fieldName: string = "") => {
      if (!excelDate) return null;
      if (
        typeof excelDate === "string" &&
        /^\d{2}-\d{2}-\d{4}$/.test(excelDate)
      ) {
        const dateParts = excelDate.split("-");
        return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      }
      if (typeof excelDate === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        const milliseconds = excelDate * 24 * 60 * 60 * 1000;
        const date = new Date(excelEpoch.getTime() + milliseconds);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
      }
      return null;
    };
    for (const record of data) {
      const normalizeField = (fieldName: string) => {
        return (
          Object.keys(record).find(
            (key) => key.replace(/[\r\n\s]+/g, " ").trim() === fieldName
          ) || fieldName
        );
      };
      const sb_no = (() => {
        const possibleFields = [
          "SB No./\r\r\nAD/EAD",
          "SB No./\r\nAD/EAD",
          "SB No./\nAD/EAD",
          "SB No./AD/EAD",
        ];

        let sbField = null;
        for (const field of possibleFields) {
          if (record[field]) {
            sbField = record[field];
            break;
          }
        }

        return sbField ? sbField.replace(/[\r\n]+/g, " ").trim() : null;
      })();

      const technicalBulletin = {
        user_id: userId,
        sb_no: sb_no,
        issue_date: formatDate(record["issue Date"]),
        revision: record.Revision,
        revision_date: formatDate(record["Revision Date"]),
        category: record["C"].trim(),
        ed_easa: record["ED EASA"],
        ed_easa_issue_date: formatDate(record["Issue Date"]),
        cdn: record.CDN,
        cdn_issue_date: formatDate(record["Issue Date_1"]),
        pa_enac: record["PA ENAC"],
        pa_enac_issue_date: formatDate(record["Issue Date_2"]),
        effectivity: record.Effectivity,
        title: record.Title,
        remark: record.Remark,
        limit_type: record["Limit Type"]
          ? record["Limit Type"].toUpperCase()
          : "ONE TIME",
        hourly_periodicity_limit:
          record[normalizeField("Periodicity/Time Limit")],
        calendar_periodicity_limit: formatDate(
          record[normalizeField("Periodicity/Calender Limit")]
        ),
        cycle_periodicity: record[normalizeField("Periodicity/Limit Cycles")],
        note: record.NOTE,
        type: record.type,
        tb_status: record.Status ? record.Status.toUpperCase() : null,
        date: record.date,
        fa_ad: record.fa_ad,
        work_report: record.work_report,
        remaining_days: record.remaining_days,
        remaining_hours: record.remaining_hours,
        remaining_cycles: record.remaining_cycles,
      };
      technicalBulletinsData.push(technicalBulletin);
    }
    const dataTosave = aircraftData.map((ik: any) => {
      const TechBullets = technicalBulletinsData.map((item: any) => {
        return {
          ...item,
          org_id: parseInt(req.body.orgId),
          type: req.body.value,
          registration_mark: ik.registration_mark,
          aircraft_type: ik.aircraft_type,
          aircraft_id: ik.id,
        };
      });
      return TechBullets;
    });
    const technicalSave = await excelRepository.save(dataTosave.flat(2));

    res.status(200).send({
      status: 200,
      message: "Excel data has been successfully saved to the database.",
      data: technicalSave,
    });
  } catch (error) {
    console.error("Error processing the file:", error);
    res.status(500).send({
      status: 500,
      message: "An error occurred while processing the file.",
    });
  }
};

export const getTechnicalBulletins = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = (req.query.search as string) || "";
    const typeFilter = (req.query.type as string) || "";
    const statusFilter = (req.query.status as string) || "";
    const createdAt = req.query.createdAt as string;
    const endAt = req.query.endAt as string;
    const offset = (page - 1) * limit;
    const aircraftId = req.query.aircraftId
      ? parseInt(req.query.aircraftId as string)
      : null;

    const databaseId = req.query.readonlyvar === "true";

    const user = await userRepository.findOne({
      where: { id: parseInt(userId) },
      relations: ["organization"],
    });

    const userBulletinsCount = await excelRepository.count({
      where: { org_id: user.organization.id },
    });
    const org_id = user.organization.id;
    if (userBulletinsCount === 0) {
      return res.status(200).send({
        status: 200,
        message: "No technical bulletins found for the logged-in user.",
        data: [],
      });
    }

    const query = excelRepository
      .createQueryBuilder("tb")
      .where("tb.org_id = :org_id", { org_id });

    if (!databaseId && aircraftId) {
      query.andWhere("tb.aircraft_id = :aircraftId", { aircraftId });
    }
    if (searchQuery) {
      query.andWhere(
        `(${[
          "sb_no",
          "issue_date",
          "revision_date",
          "revision",
          "category",
          "ed_easa",
          "ed_easa_issue_date",
          "cdn",
          "cdn_issue_date",
          "pa_enac",
          "pa_enac_issue_date",
          "effectivity",
          "title",
          "remark",
          "limit_type",
          "hourly_periodicity_limit",
          "calendar_periodicity_limit",
          "cycle_periodicity",
          "note",
          "type",
          "tb_status",
          "date",
          "fa_ad",
          "work_report",
          "remaining_days",
          "remaining_hours",
          "remaining_cycles",
          "status",
        ]
          .map((field) => `tb.${field} LIKE :searchQuery`)
          .join(" OR ")})`,
        { searchQuery: `%${searchQuery}%` }
      );
    }

    if (typeFilter) {
      query.andWhere("tb.type LIKE :typeFilter", {
        typeFilter: typeFilter,
      });
    }

    if (statusFilter) {
      const statusArray = statusFilter
        .split(",")
        .map((status) => status.trim())
        .filter((status) => status !== "");

      query.andWhere("tb.tb_status IN (:...statusArray)", { statusArray });
    }

    if (createdAt && endAt) {
      query.andWhere("tb.created_at BETWEEN :start AND :end", {
        start: new Date(createdAt),
        end: new Date(endAt),
      });
    } else if (createdAt) {
      query.andWhere("tb.created_at >= :start", { start: new Date(createdAt) });
    } else if (endAt) {
      query.andWhere("tb.created_at <= :end", { end: new Date(endAt) });
    }

    query.orderBy("tb.created_at", "DESC").skip(offset).take(limit);

    const [bulletins, total] = await query.getManyAndCount();

    if (bulletins.length === 0) {
      return res.status(200).send({
        status: 200,
        message: "No technical bulletins found matching the provided filters.",
        data: [],
      });
    }

    return res.status(200).send({
      status: 200,
      message: "Technical bulletins retrieved successfully.",
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: bulletins,
    });
  } catch (error) {
    console.error("Error fetching technical bulletins:", error);
    return res.status(500).send({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const addEvaluationHistory = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.userId;
    const {
      aircraft_id,
      eh_status,
      title,
      easa_ad,
      fa_ad,
      service_bulletin,
      evaluation_date,
      work_report,
      note,
      selected_tb_id,
      tb_appli_expiration_hour,
      tb_appli_expiration_minutes,
      tb_appli_expiration_cycle,
      appli_expiration_notice,
      remaining_days,
      remaining_hours,
      remaining_cycles,
    } = req.body;
    const user = await userRepository.findOne({
      where: { id: user_id },
      select: ["id", "org_id"],
    });

    if (!user) {
      return res
        .status(401)
        .json({ status: 401, message: "unauthenticated user" });
    }
    const org_id = user.org_id;
    const selectedTechnicalBulletin = await excelRepository.findOne({
      where: { id: selected_tb_id },
    });
    if (!selectedTechnicalBulletin) {
      return res
        .status(404)
        .json({ status: 404, message: "Technical Bulletin not found" });
    }
    const expirationNoticeDate = appli_expiration_notice
      ? new Date(appli_expiration_notice)
      : null;

    await excelRepository.update(
      { id: selected_tb_id },
      {
        user_id: user_id,
        aircraft_id: aircraft_id,
        org_id: org_id,
        tb_appli_expiration_hour,
        tb_appli_expiration_minutes,
        tb_appli_expiration_cycle,
        appli_expiration_notice: expirationNoticeDate,
        remaining_days,
        remaining_hours,
        remaining_cycles,
      }
    );
    const newEvualuation = evaluationRepository.create({
      user_id: user_id,
      aircraft_id,
      eh_status,
      title,
      easa_ad,
      fa_ad,
      service_bulletin,
      evaluation_date: new Date(),
      work_report,
      note,
    });
    await evaluationRepository.save(newEvualuation);

    res.status(201).json({
      status: 201,
      message: "Evaluation added successfully",
      data: newEvualuation,
    });
  } catch (error) {
    console.log("error", error);

    res
      .status(500)
      .json({ status: 500, message: "Error fetching evaluation", error });
  }
};

export const getEvualuationHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = (req.query.search as string) || "";
    const statusFilter = (req.query.status as string) || "";
    const createdAt = req.query.createdAt as string;
    const endAt = req.query.endAt as string;
    const offset = (page - 1) * limit;

    const evaluationCount = await evaluationRepository.count({
      where: { user_id: userId },
    });

    if (evaluationCount === 0) {
      return res.status(200).send({
        status: 200,
        message: "No evaluation history found for the logged-in user.",
        data: [],
      });
    }

    const query = evaluationRepository
      .createQueryBuilder("ev")
      .where("ev.user_id = :userId", { userId });

    if (searchQuery) {
      query.andWhere(
        `(${[
          "eh_status",
          "title",
          "easa_ad",
          "fa_ad",
          "service_bulletin",
          "evaluation_date",
          "work_report",
          "note",
        ]
          .map((field) => `ev.${field} LIKE :searchQuery`)
          .join(" OR ")})`,
        { searchQuery: `%${searchQuery}%` }
      );
    }
    if (statusFilter) {
      query.andWhere("ev.eh_status LIKE :statusFilter", {
        statusFilter: statusFilter,
      });
    }
    if (createdAt && endAt) {
      query.andWhere("ev.evaluation_date BETWEEN :start AND :end", {
        start: new Date(createdAt),
        end: new Date(endAt),
      });
    } else if (createdAt) {
      query.andWhere("ev.evaluation_date >= :start", {
        start: new Date(createdAt),
      });
    } else if (endAt) {
      query.andWhere("ev.evaluation_date <= :end", { end: new Date(endAt) });
    }

    query.orderBy("ev.evaluation_date", "DESC").skip(offset).take(limit);

    const [evaluations, total] = await query.getManyAndCount();

    if (evaluations.length === 0) {
      return res.status(200).send({
        status: 200,
        message: "No evaluations history found matching the provided filters.",
        data: [],
      });
    }
    res.status(201).json({
      status: 201,
      message: "Evaluation history retrieved successfully",
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: evaluations,
    });
  } catch (error) {
    console.log("error", error);

    res
      .status(500)
      .json({ status: 500, message: "Error fetching evaluation", error });
  }
};

export const addWorkReport = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.userId;

    if (!user_id) {
      return res.status(400).json({ status: 400, message: "Invalid user ID" });
    }
    let reports: any[] = req.body;
    if (!Array.isArray(reports)) {
      reports = [reports];
    }

    const user = await userRepository.findOne({ where: { id: user_id } });

    if (!user) {
      return res
        .status(401)
        .json({ status: 401, message: "Unauthenticated user" });
    }

    let workNo = "WR_01";
    const lastWorkReport = await workRepository
      .createQueryBuilder("work_reports")
      .orderBy("work_reports.id", "DESC")
      .take(1)
      .getOne();

    if (lastWorkReport) {
      const lastNumber = parseInt(lastWorkReport.wr_no.split("_")[1], 10);
      const nextNumber = lastNumber + 1;
      workNo = `WR_${String(nextNumber).padStart(2, "0")}`;
    }
    const newWorkReports = reports.map((report: any) => {
      return {
        user_id,
        aircraft_id: report.aircraftId,
        wr_no: workNo,
        sb_no: report?.sb_no,
        ed_easa: report?.ed_easa,
        cdn: report?.cdn,
        pa_enac: report?.pa_enac,
        title: report?.title,
        remark: report?.remark,
        limit_type: report?.limit_type,
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

    await workRepository.save(newWorkReports);

    return res.status(201).json({
      status: 201,
      message: `${newWorkReports.length} work reports added successfully`,
      data: newWorkReports,
    });
  } catch (error) {
    console.error("Error adding work report:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error while adding work report",
      error: error.message,
    });
  }
};

export const getWorkReportHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = (req.query.search as string) || "";
    const offset = (page - 1) * limit;

    const WorkReportCount = await workRepository.count({
      where: { user_id: userId },
    });

    if (WorkReportCount === 0) {
      return res.status(200).send({
        status: 200,
        message: "No work report history found for the logged-in user.",
        data: [],
      });
    }

    const query = workRepository
      .createQueryBuilder("wk")
      .where("wk.user_id = :userId", { userId });

    if (searchQuery) {
      query.andWhere(
        `(${[
          "wr_no",
          "sb_no",
          "ed_easa",
          "cdn",
          "pa_enac",
          "title",
          "remark",
          "limit_type",
          "note",
          "signature",
          "additional_control",
          "notes_measurements",
        ]
          .map((field) => `wk.${field} LIKE :searchQuery`)
          .join(" OR ")})`,
        { searchQuery: `%${searchQuery}%` }
      );
    }
    query.orderBy("wk.created_at", "DESC").skip(offset).take(limit);
    const [workReportHistory, total] = await query.getManyAndCount();

    if (workReportHistory.length === 0) {
      return res.status(200).send({
        status: 200,
        message: "No work report history found matching the provided search.",
        data: [],
      });
    }
    res.status(201).json({
      status: 201,
      message: "Work report historyretrieved successfully",
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: workReportHistory,
    });
  } catch (error) {
    console.log("error", error);

    res.status(500).json({
      status: 500,
      message: "Error fetching  work report history",
      error,
    });
  }
};

export const getProfileDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const user = await userRepository.findOne({
      where: { id: parseInt(userId) },
      relations: ["organization"],
    });
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found." });
    }
    if (user) {
      delete user.password;
    }
    return res.status(200).json({ status: 200, data: user });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};
