import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import generateToken from "../config/jwt.js";
import { createNotification } from "../utils/notify.js";

const pendingDoctorQuery = {
  $or: [
    { approvalStatus: "pending" },
    { approvalStatus: { $exists: false }, isApproved: false },
  ],
};

const getAdminIdentity = () => ({
  _id: "admin",
  name: process.env.ADMIN_NAME || "System Admin",
  email: process.env.ADMIN_EMAIL || "",
  role: "admin",
});

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return res.status(500).json({
        message: "Admin credentials are not configured",
      });
    }

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const admin = getAdminIdentity();

    res.json({
      success: true,
      token: generateToken(admin._id, "admin"),
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminDashboard = async (_req, res) => {
  try {
    const [
      patients,
      totalDoctors,
      pendingDoctors,
      totalAppointments,
      completedAppointments,
      paidAppointments,
      appointments,
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Doctor.countDocuments(pendingDoctorQuery),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({ paymentStatus: "paid" }),
      Appointment.find({})
        .populate("doctorId", "name specialization")
        .populate("patientId", "name email")
        .sort({ createdAt: -1 })
        .limit(12),
    ]);

    const approvedDoctors = await Doctor.countDocuments({ isApproved: true });

    res.json({
      success: true,
      metrics: {
        patients,
        totalDoctors,
        approvedDoctors,
        pendingDoctors,
        paidAppointments,
        totalAppointments,
        completedAppointments,
      },
      recentAppointments: appointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingDoctors = async (_req, res) => {
  try {
    const doctors = await Doctor.find(pendingDoctorQuery).sort({
      createdAt: -1,
    });

    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        approvalStatus: "approved",
        rejectionReason: "",
      },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await createNotification({
      recipientId: doctor._id,
      recipientRole: "doctor",
      title: "Profile approved",
      message: "Your doctor account has been approved. You can now start receiving appointments.",
      type: "approval",
      actionUrl: "/doctor-dashboard",
      email: doctor.email,
    });

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectDoctor = async (req, res) => {
  try {
    const { reason = "Please contact support for details." } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        approvalStatus: "rejected",
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await createNotification({
      recipientId: doctor._id,
      recipientRole: "doctor",
      title: "Profile review update",
      message: `Your doctor account was not approved. Reason: ${reason}`,
      type: "approval",
      actionUrl: "/doctor-home",
      email: doctor.email,
    });

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
