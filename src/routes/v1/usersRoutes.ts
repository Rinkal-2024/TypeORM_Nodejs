import { Router } from "express";
import { addlanguage, loginUser, registerUser } from "../../controllers/UserController";
import { authenticateUser } from "../../middlewares/AuthMiddleware";
import { uploadeexele } from "../../controllers/TechincalController";
import multer = require("multer");

const router = Router();

router.post("/register" , registerUser);
router.post("/fetch-users", loginUser);
router.post("/add-language/:id", authenticateUser, addlanguage);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
router.post(
  "/techincal-bullettins",
  upload.single("file"),
  authenticateUser,
  uploadeexele
);
export default router;
