import express from "express";
import { uploadReport, getPatientReports } from "../controllers/report.portal.controller.js";

const router = express.Router();

router.post("/upload", uploadReport);
router.get("/patient/:patientId", getPatientReports);
export default router;
