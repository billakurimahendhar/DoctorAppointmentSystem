import express from "express";  
import upload from "../middlewares/upload.js";
import {
  registerDoctor,
  loginDoctor,
  getDoctorSlots,
  getAllApprovedDoctors,
  listDoctors
} from "../controllers/doctor.controller.js";
import { uploadDoctorPhoto } from "../controllers/doctor.controller.js";
import { getDoctorById } from "../controllers/doctor.controller.js";



const router = express.Router();
router.get("/", listDoctors);
router.post("/register", registerDoctor);
router.post("/login", loginDoctor);
router.get("/:id/slots", getDoctorSlots);
router.post("/:id/upload-photo", upload.single("image"), uploadDoctorPhoto);
//router.get("/", getAllApprovedDoctors); // ✅ fetch all approved doctors
router.get("/profile/:id", getDoctorById);

export default router;
