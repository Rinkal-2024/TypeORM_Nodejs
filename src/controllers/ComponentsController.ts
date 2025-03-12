import { Request, Response } from "express";
import { AppDataSource } from "../index";
import * as XLSX from "xlsx";
import multer = require("multer");
import { Users } from "../models/UsersModel";
import { Components } from "../models/ComponentsModel";

const componentsRepository = AppDataSource.getRepository(Components);
// const componentsWorkReportRepository =
//   AppDataSource.getRepository(InspectionHistory);
const userRepository = AppDataSource.getRepository(Users);

const upload = multer({ dest: "uploads/" });
export const uploadComponentsExcel = async (req: Request, res: Response) => {
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
    const componentsData: any[] = [];
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
      const createComponents = {
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
      componentsData.push(createComponents);
    }
    const componentsDatas = componentsData.map((item: any) => {
      return {
        ...item,
        org_id: parseInt(req.body.orgId),
        aircraft_id: aircraftsId,
      };
    });

    const componentsSave = await componentsRepository.save(
      componentsDatas
    );
    res.status(200).send({
      status: 200,
      message: "Excel data has been successfully saved to the database.",
      data: componentsSave,
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

    const userinspectionCount = await componentsRepository.count({
      where: { org_id: user.organization.id },
    });

    if (userinspectionCount === 0) {
      return res.status(200).send({
        status: 200,
        message:
          "No components found for the logged-in user.",
        data: [],
      });
    }

    const query = componentsRepository
      .createQueryBuilder("com")
      .where("com.org_id = :org_id", { org_id });

    if (!databaseId && aircraftId) {
      query.andWhere("com.aircraft_id = :aircraftId", {
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
          "i_key",
        ]
          .map((field) => `com.${field} LIKE :searchQuery`)
          .join(" OR ")})`,
        { searchQuery: `%${searchQuery}%` }
      );
    }

    query.orderBy("com.created_at", "DESC").skip(offset).take(limit);

    const [componentsData, total] = await query.getManyAndCount();

    if (componentsData.length === 0) {
      return res.status(200).send({
        status: 200,
        message: "No components found matching the provided filters.",
        data: [],
      });
    }

    return res.status(200).send({
      status: 200,
      message: "components retrieved successfully.",
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: componentsData,
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};




