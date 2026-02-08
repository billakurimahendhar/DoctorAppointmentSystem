import bcrypt from "bcryptjs";
import Doctor from "../models/doctor.model.js";
import generateToken from "../config/jwt.js";
import Slot from "../models/slot.model.js";
import cloudinary from "../config/cloudinary.js";
import { profile } from "console";
/* -------------------------------------------------------------------------- */
/* ✅ Helper: Generate 7 days × 30-min slots (10 AM–10 PM)                    */
/* -------------------------------------------------------------------------- */
const generateSlotsForDoctor = async (doctorId) => {
  const today = new Date();
  const times = [];

  // create 30-min time intervals from 10:00 AM to 10:00 PM
  for (let hour = 10; hour < 22; hour++) {
    times.push(`${hour}:00`);
    times.push(`${hour}:30`);
  }

  const slots = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];

    times.forEach((time) => {
      slots.push({ doctorId, date: dateStr, time, isBooked: false });
    });
  }

  await Slot.insertMany(slots);
  console.log(`✅ ${slots.length} slots generated for Doctor ${doctorId}`);
};

/* -------------------------------------------------------------------------- */
/* ✅ Register Doctor (Auto-slot generation)                                  */
/* -------------------------------------------------------------------------- */
export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, qualification, specialization, experience } = req.body;

    const existing = await Doctor.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      qualification,
      specialization,
      experience,
      isApproved: false,
    });

    // Auto-generate slots after registration
    await generateSlotsForDoctor(doctor._id);

    res.status(201).json({
      success: true,
      message: "Doctor registered successfully and slots auto-generated (awaiting approval)",
      token: generateToken(doctor._id, "doctor"),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ Login Doctor (Only if approved)                                         */
/* -------------------------------------------------------------------------- */

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (!doctor.isApproved)
      return res.status(401).json({ message: "You are not approved yet" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(doctor._id, "doctor"),
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      profileImage: doctor.profileImage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ Get All Available (Unbooked) Slots                                     */
/* -------------------------------------------------------------------------- */
// GET /api/doctor/:id/slots  (updated 🔄)
// controllers/doctor.controller.js



export const getDoctorSlots = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 🗑 Delete slots before today
    await Slot.deleteMany({
      doctorId,
      date: { $lt: todayStr },
    });

    // 📅 Prepare rolling 7 days from today
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      next7Days.push(d.toISOString().split("T")[0]);
    }

    // 🔍 Fetch existing slots
    let slots = await Slot.find({ doctorId });

    // 🧠 Generate missing slots for future days
    const times = [];
    for (let hour = 10; hour < 22; hour++) {
      times.push(`${hour}:00`, `${hour}:30`);
    }

    const existingDates = [...new Set(slots.map((s) => s.date))];

    for (const date of next7Days) {
      if (!existingDates.includes(date)) {
        const newSlots = times.map((time) => ({
          doctorId,
          date,
          time,
          isBooked: false,
        }));
        await Slot.insertMany(newSlots);
      }
    }

    // 🔄 Fetch fresh slots after generation
    slots = await Slot.find({ doctorId });

    // ⏳ Remove past time slots of today
    slots = slots.filter((slot) => {
      if (slot.date > todayStr) return true;
      if (slot.date < todayStr) return false;

      const [h, m] = slot.time.split(":").map(Number);
      return h * 60 + m > currentMinutes;
    });

    // 📊 Sort slots
    slots.sort((a, b) =>
      a.date === b.date
        ? a.time.localeCompare(b.time)
        : a.date.localeCompare(b.date)
    );

    res.json({ success: true, slots });
  } catch (error) {
    console.error("❌ Slot fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};





// GET /api/doctor
export const getAllApprovedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: true }).select(
      "name qualification specialization experience email"
    );
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const listDoctors = async (_req, res) => {
  try {
    const docs = await Doctor.find(
      { isApproved: true },
      "name specialization qualification experience profileImage" // public fields
    ).sort({ name: 1 });
    res.json({ success: true, doctors: docs });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 🔁 ROLLING SLOT WINDOW: always keep 7 future days only
export const refreshDoctorSlots = async (doctorId) => {
  const now = new Date(); // current date & time
  const todayStr = now.toISOString().split("T")[0];

  // 1️⃣ Delete old slots (before today OR earlier than current time)
  await Slot.deleteMany({
    doctorId,
    $or: [
      { date: { $lt: todayStr } },
      {
        date: todayStr,
        time: { $lt: `${now.getHours()}:${now.getMinutes()}` }
      }
    ]
  });

  // 2️⃣ Find remaining future slots
  const futureSlots = await Slot.find({ doctorId }).distinct("date");
  const lastAvailableDate = futureSlots.sort().slice(-1)[0] || todayStr;

  // 3️⃣ Generate slots to keep 7 total days from NOW
  const neededDays = 7 - futureSlots.length;

  if (neededDays > 0) {
    const slotsToAdd = [];
    for (let i = 1; i <= neededDays; i++) {
      const newDate = new Date(lastAvailableDate);
      newDate.setDate(newDate.getDate() + i);
      const dateStr = newDate.toISOString().split("T")[0];

      for (let hour = 10; hour < 22; hour++) {
        slotsToAdd.push({ doctorId, date: dateStr, time: `${hour}:00`, isBooked: false });
        slotsToAdd.push({ doctorId, date: dateStr, time: `${hour}:30`, isBooked: false });
      }
    }

    await Slot.insertMany(slotsToAdd);
    console.log(`🆕 Added ${slotsToAdd.length} new rolling slots`);
  }
};

export const uploadDoctorPhoto = async (req, res) => {
  try {
    const doctorId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const result = await cloudinary.uploader.upload_stream(
      { folder: "mediconnect/doctors" },
      async (error, uploadResult) => {
        if (error) return res.status(500).json({ message: error.message });

        const doctor = await Doctor.findByIdAndUpdate(
          doctorId,
          { profileImage: uploadResult.secure_url },
          { new: true }
        );

        res.json({
          success: true,
          message: "Profile photo updated",
          profileImage: doctor.profileImage,
        });
      }
    );

    result.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select(
      "name qualification specialization experience feesPerConsultation profileImage"
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
