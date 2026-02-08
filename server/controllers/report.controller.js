// backend/controllers/report.controller.js
import Report from "../models/report.model.js";
import Appointment from "../models/appointment.model.js";
import mongoose from "mongoose";

// 🩺 Doctor uploads a test report (with disease, test type, medicines)
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

    console.log("📝 Saving report for:", diseaseName, value);

    const report = await Report.create({
      doctorId,
      patientId,
      appointmentId,
      diseaseName: diseaseName.trim(),
      testType,
      value,
      unit,
      prescribedMedicines,
      notes,
      date,
    });

    res.status(201).json({ success: true, report });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
};




// 📊 Get reports grouped by disease — for graphs
export const getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    const reports = await Report.find({ patientId })
      .populate("doctorId", "name")
      .sort({ date: 1 })
      .lean();

    if (!reports.length) {
      return res.json({ success: true, groupedByDisease: {} });
    }

    // ✅ GROUP SAFELY
    const grouped = {};

    for (const r of reports) {
      const diseaseKey = (r.diseaseName || "general").trim().toLowerCase();

      if (!grouped[diseaseKey]) grouped[diseaseKey] = [];

      grouped[diseaseKey].push({
        _id: r._id,
        date: r.date,
        value: Number(r.value),
        unit: r.unit,
        notes: r.notes,
        doctorName: r.doctorId?.name || "Doctor",
        prescribedMedicines: r.prescribedMedicines || [],
      });
    }

    res.json({
      success: true,
      groupedByDisease: grouped,
    });
  } catch (error) {
    console.error("Fetch patient reports error:", error);
    res.status(500).json({ message: error.message });
  }
};


