import express from "express";
import {
  bookAppointment,
  getDoctorAppointments,
  getPatientAppointments
} from "../controllers/appointment.controller.js";
import { completeAppointment } from "../controllers/appointment.controller.js";



const router = express.Router();

router.post("/book", bookAppointment); // patient books
router.get("/doctor/:id", getDoctorAppointments); // doctor sees booked
router.get("/patient/:id", getPatientAppointments); // patient sees booked
router.put("/complete/:id", completeAppointment);

export default router;
