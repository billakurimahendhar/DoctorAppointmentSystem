import express from "express";
import {
  forgotPatientPassword,
  loginPatient,
  registerPatient,
  resendPatientVerificationEmail,
  resetPatientPassword,
  verifyPatientEmail,
} from "../controllers/patient.controller.js";

const router = express.Router();

router.post("/register", registerPatient);
router.post("/login", loginPatient);
router.get("/verify-email", verifyPatientEmail);
router.post("/resend-verification", resendPatientVerificationEmail);
router.post("/forgot-password", forgotPatientPassword);
router.post("/reset-password", resetPatientPassword);

export default router;
