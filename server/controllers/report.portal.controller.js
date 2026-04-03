import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import Report from "../models/report.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import { createNotification } from "../utils/notify.js";

const normalizeMedicines = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim());
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const uploadReport = async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      appointmentId,
      diseaseName,
      testType,
      value,
      unit,
      prescribedMedicines,
      notes,
      date,
    } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const report = await Report.create({
      doctorId,
      patientId,
      appointmentId,
      diseaseName: diseaseName.trim(),
      testType: testType?.trim() || "General Checkup",
      value,
      unit,
      prescribedMedicines: normalizeMedicines(prescribedMedicines),
      notes,
      date,
    });

    const [patient, doctor] = await Promise.all([
      Patient.findById(patientId).lean(),
      Doctor.findById(doctorId).lean(),
    ]);

    await createNotification({
      recipientId: patientId,
      recipientRole: "patient",
      title: "New report available",
      message: `Dr. ${doctor?.name || "Doctor"} uploaded your ${report.diseaseName} report.`,
      type: "report",
      actionUrl: "/patient-reports",
      email: patient?.email,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    const reports = await Report.find({ patientId })
      .populate("doctorId", "name specialization qualification")
      .sort({ date: 1, createdAt: 1 })
      .lean();

    const grouped = {};

    for (const report of reports) {
      const key = (report.diseaseName || "general").trim().toLowerCase();

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push({
        _id: report._id,
        date: report.date,
        diseaseName: report.diseaseName,
        testType: report.testType,
        value: Number(report.value),
        unit: report.unit,
        notes: report.notes,
        doctorName: report.doctorId?.name || "Doctor",
        doctorSpecialization: report.doctorId?.specialization || "",
        prescribedMedicines: report.prescribedMedicines || [],
      });
    }

    res.json({
      success: true,
      groupedByDisease: grouped,
      reports: reports.map((report) => ({
        _id: report._id,
        appointmentId: report.appointmentId,
        date: report.date,
        diseaseName: report.diseaseName,
        testType: report.testType,
        value: Number(report.value),
        unit: report.unit,
        notes: report.notes,
        doctorName: report.doctorId?.name || "Doctor",
        doctorSpecialization: report.doctorId?.specialization || "",
        prescribedMedicines: report.prescribedMedicines || [],
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
