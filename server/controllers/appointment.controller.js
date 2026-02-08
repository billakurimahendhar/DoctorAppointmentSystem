import Appointment from "../models/appointment.model.js";
import Slot from "../models/slot.model.js";
import Report from "../models/report.model.js";

// patient books
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, slotId, date, time, paymentMode } = req.body;

    const existing = await Appointment.findOne({ slotId });
    if (existing) return res.status(400).json({ message: "Slot already booked" });

    const appt = await Appointment.create({
      doctorId,
      patientId,
      slotId,
      date,
      time,
      paymentMode: paymentMode || "offline",  // ✅ NEW
      paymentStatus: paymentMode === "online" ? "paid" : "pending",
      isCompleted: false,
    });

    await Slot.findByIdAndUpdate(slotId, { isBooked: true });

    res.status(201).json({ success: true, appointment: appt });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


// doctor’s appointments


const isPast = (dateStr, timeStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const apptDate = new Date(y, m - 1, d, hh, mm);
  return apptDate.getTime() < Date.now();
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // fetch all appointments for doctor
    let appointments = await Appointment.find({ doctorId })
      .populate("patientId", "name email")
      .sort({ date: 1, time: 1 });

    // mark old booked ones as completed
    const bulk = [];
    appointments.forEach((a) => {
      if (a.status === "booked" && isPast(a.date, a.time)) {
        bulk.push({
          updateOne: {
            filter: { _id: a._id },
            update: { $set: { status: "completed" } },
          },
        });
      }
    });

    if (bulk.length > 0) {
      await Appointment.bulkWrite(bulk);
      appointments = await Appointment.find({ doctorId })
        .populate("patientId", "name email")
        .sort({ date: 1, time: 1 });
    }

    res.json({ success: true, appointments });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


// patient’s appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.params.id;
    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "name specialization")
      .sort({ date: 1, time: 1 });
    res.json({ success: true, appointments });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    appt.status = "completed";
    await appt.save();

    res.json({ success: true, message: "Appointment marked completed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getPatientTimeline = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patientId })
  .populate("doctorId", "name specialization profileImage").sort({ date: 1, time: 1 }).lean(); // lean() for plain JS objects


    // Attach medicines from reports for each appointment
    for (let appt of appointments) {
      const reports = await Report.find({ appointmentId: appt._id }).lean();
      appt.medicines = reports.flatMap(r => r.prescribedMedicines || []);
      appt.diseases = reports.map(r => r.diseaseName);
    }

    res.json({ success: true, timeline: appointments });
  } catch (err) {
    console.error("Timeline error:", err);
    res.status(500).json({ message: err.message });
  }
};
