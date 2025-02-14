import { Request, Response } from "express";
import { AppDataSource } from "../index";
import * as XLSX from "xlsx";
import { TechincalBullettins } from "../models/TechincalBullettinsModel";
import multer = require("multer");

const excelRepository = AppDataSource.getRepository(TechincalBullettins);
const upload = multer({ dest: "uploads/" });
export const uploadeexele = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded!");
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).send("Invalid user!");
    }
    const techincalBullettinArray = [];
    const formatDateTime = (excelDate: any) => {
      if (!excelDate) return null;
      const excelEpoch = new Date(1899, 11, 30); // Excel epoch starts on December 30, 1899
      const milliseconds = excelDate * 24 * 60 * 60 * 1000; // Convert days (with fraction) to milliseconds
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

        return sbField
          ? sbField.replace(/[\r\n]+/g, " ").trim() // Replace multiple newlines with a space
          : null;
      })();

      const techincalBullettin = {
        user_id: userId,
        sb_no: sb_no,
        issue_date: formatDateTime(record["issue Date"]),
        revision: record.revision,
        revision_date: formatDateTime(record["Revision Date"]),
        category: record["C"].trim(),
        ed_easa: record["ED EASA"],
        ed_easa_issue_date: formatDateTime(record["Issue Date"]),
        cdn: record.CDN,
        cdn_issue_date: formatDateTime(record["Issue Date_1"]),
        pa_enac: record["PA ENAC"],
        pa_enac_issue_date: formatDateTime(record["Issue Date_2"]),
        effectivity: record.Effectivity,
        title: record.Title,
        remark: record.Remark,
        limit_type: record["TIPO LIMITE"],
        hourly_periodicity_limit: record["PERIODICITA'/LIMITE ORARIO"],
        calendar_periodicity_limit: record["PERIODICITA'/LIMITE CALENDARIALE"],
        cycle_periodicity: record["PERIODICITA' CICLI"],
        note: record.NOTE,
        // type: record.type,
        // tb_status: record.tb_status,
        // date: record.date,
        // fa_ad: record.fa_ad,
        // work_report: record.work_report,
        // remaining_days: record.remaining_days,
        // remaining_hours: record.remaining_hours,
        // remaining_cycles: record.remaining_cycles,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await excelRepository.save(techincalBullettin);
      techincalBullettinArray.push(techincalBullettin);
    }

    res.status(200).send({
      status: 200,
      message: "Excel data has been successfully saved to the database.",
      data: techincalBullettinArray,
    });
  } catch (error) {
    console.error("Error processing the file:", error);
    res.status(500).send({
      status: 500,
      message: "An error occurred while processing the file.",
    });
  }
};
