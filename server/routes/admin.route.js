import express from "express";
import {
  approveDoctor,
  getAdminDashboard,
  getPendingDoctors,
  loginAdmin,
  rejectDoctor,
} from "../controllers/admin.controller.js";
import protect, { authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/dashboard", protect, authorizeRoles("admin"), getAdminDashboard);
router.get("/doctors/pending", protect, authorizeRoles("admin"), getPendingDoctors);
router.patch("/doctors/:id/approve", protect, authorizeRoles("admin"), approveDoctor);
router.patch("/doctors/:id/reject", protect, authorizeRoles("admin"), rejectDoctor);

export default router;
