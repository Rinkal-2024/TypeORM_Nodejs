import { Router } from "express";
import {
  addLanguages,
  loginUser,
  logOut,
} from "../../controllers/UserController";
import { authMiddlewareController } from "../../middlewares/AuthMiddleware";
import {
  addEvaluationHistory,
  addWorkReport,
  getEvualuationHistory,
  getProfileDetails,
  getTechnicalBulletins,
  getWorkReportHistory,
  uploadExcel,
} from "../../controllers/TechnicalController";
import multer = require("multer");
import { getInspectionData, inspectionWorkReport, inspectionWorkReportHistory, uploadInspectionExcel } from "../../controllers/InspectionsController";
import { getAircrafts } from "../../controllers/AircraftController";
import { getComponentsData, uploadComponentsExcel } from "../../controllers/ComponentsController";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/login", loginUser);
router.post("/logout", logOut);
router.post("/languages/:id", authMiddlewareController, addLanguages);
router.post("/technicalBulletins", upload.single("file"), authMiddlewareController, uploadExcel);
router.get("/technicalBulletins", authMiddlewareController, getTechnicalBulletins);
router.post("/tbEvualuationHistory", authMiddlewareController, addEvaluationHistory);
router.get("/fetchEvualuationHistory", authMiddlewareController, getEvualuationHistory);
router.post("/tbWorkReport", authMiddlewareController, addWorkReport);
router.get("/tbWorkReportHistory", authMiddlewareController, getWorkReportHistory);
router.post("/inspection", upload.single("file"), authMiddlewareController, uploadInspectionExcel);
router.get("/fetchInspection", authMiddlewareController, getInspectionData);
router.post("/inspectionWorkReport", authMiddlewareController, inspectionWorkReport);
router.get("/inspectionWorkReportHistory", authMiddlewareController, inspectionWorkReportHistory);
router.get("/profile", authMiddlewareController, getProfileDetails);
router.get("/aircraft", authMiddlewareController, getAircrafts);
router.post("/components", authMiddlewareController, uploadComponentsExcel);
router.get("/fechComponents", authMiddlewareController, getComponentsData);


// export default router;
module.exports = router;
