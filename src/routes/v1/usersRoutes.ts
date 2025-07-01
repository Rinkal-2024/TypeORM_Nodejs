import { Router } from "express";
import {
  addLanguages,
  changePassword,
  loginUser,
  logOut,
  organizationPeople
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
  getEvualuationDeadlineHistory,
  insertTechnicalUpdate
} from "../../controllers/TechnicalController";
import multer = require("multer");
import {
  getInspectionData,
  insertInspectionAndWorkReport,
  inspectionEvaluation,
  inspectionWorkReportHistory,
  uploadInspectionExcel,
  inspectionDeadlineData,
  inspectionUpdate,
  closeWorkReport
} from "../../controllers/InspectionsController";
import { getAircrafts } from "../../controllers/AircraftController";
import {
  componentEvaluation,
  getComponentsData,
  getComponentsDeadlineData,
  uploadComponentsExcel,
  insertcomponentEvaluation,
} from "../../controllers/ComponentsController";
import { getMovementsData, distinctMovementType } from "../../controllers/MovementsController";

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
router.post("/inspectionWorkReport", authMiddlewareController, insertInspectionAndWorkReport);
router.get("/inspectionWorkReportHistory", authMiddlewareController, inspectionWorkReportHistory);
router.get("/profile", authMiddlewareController, getProfileDetails);
router.get("/aircraft", authMiddlewareController, getAircrafts);
router.post("/components", upload.single("file"), authMiddlewareController, uploadComponentsExcel);
router.get("/fechComponents", authMiddlewareController, getComponentsData);
router.get("/fetchInspectionDeadline", authMiddlewareController, inspectionDeadlineData);
router.get("/fetchComponentDeadline", authMiddlewareController, getComponentsDeadlineData);
router.get("/fetchBulletinsDeadline", authMiddlewareController, getEvualuationDeadlineHistory);
router.get("/fetchMovements", authMiddlewareController, getMovementsData);
router.post("/changePassword", authMiddlewareController, changePassword);
router.post("/inspectionUpdate", authMiddlewareController, inspectionUpdate);
router.get("/organizationPeople", authMiddlewareController, organizationPeople);
router.get("/distinctMovementType", authMiddlewareController, distinctMovementType);
router.get("/fechinspectionEvaluation", authMiddlewareController, inspectionEvaluation);
router.get("/fetchComponentEvaluation", authMiddlewareController, componentEvaluation);
router.post("/addComponentEvaluation", authMiddlewareController, insertcomponentEvaluation);
router.post("/updateTechnicalBulletin", authMiddlewareController, insertTechnicalUpdate);
router.post("/closeWorkReport", authMiddlewareController, closeWorkReport);

// export default router;
module.exports = router;
