import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  completeAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  getPatientTimeline,
  getAppointmentsByRole,
  rescheduleAppointment,
} from "../controllers/appointment.portal.controller.js";


const router = express.Router();
router.get("/", getAppointmentsByRole); // for doctor dashboard
router.post("/book", bookAppointment); // patient books
router.get("/doctor/:id", getDoctorAppointments); // doctor sees booked
router.get("/patient/:id", getPatientAppointments); // patient sees booked
router.patch("/:id/cancel", cancelAppointment);
router.patch("/:id/reschedule", rescheduleAppointment);
router.put("/complete/:id", completeAppointment);
router.get("/patient/:patientId/timeline", getPatientTimeline);


export default router;
