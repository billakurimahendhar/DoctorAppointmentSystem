import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import Slot from "../models/slot.model.js";
import Report from "../models/report.model.js";
import Review from "../models/review.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import { createNotifications } from "../utils/notify.js";

const isPast = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  const appointmentDate = new Date(year, month - 1, day, hours, minutes);
  return appointmentDate.getTime() < Date.now();
};

const attachReviewsToAppointments = async (appointments = []) => {
  const appointmentIds = appointments.map((item) => item._id);
  const reviews = await Review.find({ appointmentId: { $in: appointmentIds } }).lean();
  const reviewMap = new Map(reviews.map((review) => [String(review.appointmentId), review]));

  return appointments.map((appointment) => ({
    ...appointment,
    review: reviewMap.get(String(appointment._id)) || null,
    canReview:
      appointment.status === "completed" &&
      !reviewMap.has(String(appointment._id)),
  }));
};

export const bookAppointment = async (req, res) => {
  let claimedSlot = null;

  try {
    const {
      doctorId,
      patientId,
      slotId,
      date,
      time,
      paymentMode,
      reason = "General Consultation",
    } = req.body;

    claimedSlot = await Slot.findOneAndUpdate(
      {
        _id: slotId,
        doctorId,
        date,
        time,
        isBooked: false,
        status: "available",
      },
      {
        $set: {
          isBooked: true,
          status: "booked",
        },
      },
      { new: true }
    );

    if (!claimedSlot) {
      return res.status(400).json({ message: "Slot already booked or unavailable" });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId,
      slotId,
      date,
      time,
      reason,
      paymentMode: paymentMode || "offline",
      paymentStatus: paymentMode === "online" ? "paid" : "pending",
      status: "booked",
    });

    const [doctor, patient] = await Promise.all([
      Doctor.findById(doctorId).lean(),
      Patient.findById(patientId).lean(),
    ]);

    await createNotifications([
      {
        recipientId: patientId,
        recipientRole: "patient",
        title: "Appointment booked",
        message: `Your appointment with Dr. ${doctor?.name || "Doctor"} is confirmed for ${date} at ${time}.`,
        type: "appointment",
        actionUrl: "/patient-appointments",
        email: patient?.email,
      },
      {
        recipientId: doctorId,
        recipientRole: "doctor",
        title: "New appointment booked",
        message: `${patient?.name || "A patient"} booked an appointment for ${date} at ${time}.`,
        type: "appointment",
        actionUrl: "/doctor/appointments",
        email: doctor?.email,
      },
    ]);

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    if (claimedSlot?._id) {
      await Slot.findByIdAndUpdate(claimedSlot._id, {
        isBooked: false,
        status: "available",
      }).catch(() => null);
    }

    res.status(500).json({ message: error.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.params.id;

    let appointments = await Appointment.find({ doctorId })
      .populate("patientId", "name email")
      .sort({ date: 1, time: 1 })
      .lean();

    const completedIds = appointments
      .filter((item) => item.status === "booked" && isPast(item.date, item.time))
      .map((item) => item._id);

    if (completedIds.length > 0) {
      await Appointment.updateMany(
        { _id: { $in: completedIds } },
        { $set: { status: "completed" } }
      );

      appointments = await Appointment.find({ doctorId })
        .populate("patientId", "name email")
        .sort({ date: 1, time: 1 })
        .lean();
    }

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.params.id;

    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "name specialization profileImage feesPerConsultation")
      .sort({ date: -1, time: -1 })
      .lean();

    res.json({
      success: true,
      appointments: await attachReviewsToAppointments(appointments),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cancelledBy = "patient",
      cancellationReason = "Schedule changed",
    } = req.body;

    const appointment = await Appointment.findById(id)
      .populate("doctorId", "name email")
      .populate("patientId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "booked") {
      return res.status(400).json({ message: "Only booked appointments can be cancelled" });
    }

    appointment.status = "cancelled";
    appointment.cancelledBy = cancelledBy;
    appointment.cancellationReason = cancellationReason;
    await appointment.save();

    await Slot.findByIdAndUpdate(appointment.slotId, {
      isBooked: false,
      status: "available",
    });

    await createNotifications([
      {
        recipientId: appointment.patientId._id,
        recipientRole: "patient",
        title: "Appointment cancelled",
        message: `Your appointment on ${appointment.date} at ${appointment.time} was cancelled.`,
        type: "appointment",
        actionUrl: "/patient-appointments",
        email: appointment.patientId.email,
      },
      {
        recipientId: appointment.doctorId._id,
        recipientRole: "doctor",
        title: "Appointment cancelled",
        message: `${appointment.patientId.name} cancelled the appointment on ${appointment.date} at ${appointment.time}.`,
        type: "appointment",
        actionUrl: "/doctor/appointments",
        email: appointment.doctorId.email,
      },
    ]);

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rescheduleAppointment = async (req, res) => {
  let newSlot = null;

  try {
    const { id } = req.params;
    const { slotId: newSlotId } = req.body;

    const appointment = await Appointment.findById(id)
      .populate("doctorId", "name email")
      .populate("patientId", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "booked") {
      return res.status(400).json({ message: "Only booked appointments can be rescheduled" });
    }

    newSlot = await Slot.findOneAndUpdate(
      {
        _id: newSlotId,
        doctorId: appointment.doctorId._id,
        isBooked: false,
        status: "available",
      },
      { $set: { isBooked: true, status: "booked" } },
      { new: true }
    );

    if (!newSlot) {
      return res.status(400).json({ message: "Selected slot is no longer available" });
    }

    const oldSlotId = appointment.slotId;
    const previousSlot = {
      date: appointment.date,
      time: appointment.time,
      slotId: String(appointment.slotId),
    };

    appointment.slotId = newSlot._id;
    appointment.date = newSlot.date;
    appointment.time = newSlot.time;
    appointment.rescheduledFrom = previousSlot;
    appointment.rescheduledAt = new Date();
    await appointment.save();

    await Slot.findByIdAndUpdate(oldSlotId, {
      isBooked: false,
      status: "available",
    });

    await createNotifications([
      {
        recipientId: appointment.patientId._id,
        recipientRole: "patient",
        title: "Appointment rescheduled",
        message: `Your appointment with Dr. ${appointment.doctorId.name} was moved to ${appointment.date} at ${appointment.time}.`,
        type: "appointment",
        actionUrl: "/patient-appointments",
        email: appointment.patientId.email,
      },
      {
        recipientId: appointment.doctorId._id,
        recipientRole: "doctor",
        title: "Appointment rescheduled",
        message: `${appointment.patientId.name}'s appointment is now scheduled for ${appointment.date} at ${appointment.time}.`,
        type: "appointment",
        actionUrl: "/doctor/appointments",
        email: appointment.doctorId.email,
      },
    ]);

    res.json({ success: true, appointment });
  } catch (error) {
    if (newSlot?._id) {
      await Slot.findByIdAndUpdate(newSlot._id, {
        isBooked: false,
        status: "available",
      }).catch(() => null);
    }

    res.status(500).json({ message: error.message });
  }
};

export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "completed";
    await appointment.save();

    res.json({ success: true, message: "Appointment marked completed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientTimeline = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "name specialization profileImage")
      .sort({ date: 1, time: 1 })
      .lean();

    const reviews = await Review.find({
      appointmentId: { $in: appointments.map((item) => item._id) },
    }).lean();
    const reviewMap = new Map(reviews.map((review) => [String(review.appointmentId), review]));

    for (const appointment of appointments) {
      const reports = await Report.find({ appointmentId: appointment._id }).lean();
      appointment.medicines = reports.flatMap((report) => report.prescribedMedicines || []);
      appointment.diseases = reports.map((report) => report.diseaseName);
      appointment.review = reviewMap.get(String(appointment._id)) || null;
      appointment.canReview =
        appointment.status === "completed" && !reviewMap.has(String(appointment._id));
    }

    res.json({ success: true, timeline: appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointmentsByRole = async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    let filter = {};

    if (role === "doctor") {
      filter = { doctorId: userId };
    } else if (role === "patient") {
      filter = { patientId: userId };
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email")
      .populate("doctorId", "name specialization")
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
