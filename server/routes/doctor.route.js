import express from "express";
import upload from "../middlewares/upload.js";
import {
  forgotDoctorPassword,
  registerDoctor,
  loginDoctor,
  listDoctors,
  resendDoctorVerificationEmail,
  resetDoctorPassword,
  verifyDoctorEmail,
  uploadDoctorPhoto,
  getDoctorById,
} from "../controllers/doctor.portal.controller.js";
import {
  addDoctorAvailabilitySlot,
  getDoctorAvailability,
  getPatientFacingSlots,
  updateDoctorAvailabilitySlot,
} from "../controllers/availability.controller.js";



const router = express.Router();
router.get("/", listDoctors);
router.post("/register", registerDoctor);
router.post("/login", loginDoctor);
router.get("/verify-email", verifyDoctorEmail);
router.post("/resend-verification", resendDoctorVerificationEmail);
router.post("/forgot-password", forgotDoctorPassword);
router.post("/reset-password", resetDoctorPassword);
router.get("/:id/slots", getPatientFacingSlots);
router.get("/:id/availability", getDoctorAvailability);
router.post("/:id/availability", addDoctorAvailabilitySlot);
router.patch("/:id/availability/:slotId", updateDoctorAvailabilitySlot);
router.post("/:id/upload-photo", upload.single("image"), uploadDoctorPhoto);
//router.get("/", getAllApprovedDoctors); // ✅ fetch all approved doctors
router.get("/profile/:id", getDoctorById);

export default router;
