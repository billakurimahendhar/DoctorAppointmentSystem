import Slot from "../models/slot.model.js";
import {
  ensureDoctorAvailabilityWindow,
  filterVisiblePatientSlots,
  parseTimeToMinutes,
  sortSlotsByDateTime,
  toDateString,
} from "../utils/slots.js";

const isPastSlot = (date, time) => {
  const todayStr = toDateString();

  if (date < todayStr) {
    return true;
  }

  if (date > todayStr) {
    return false;
  }

  const now = new Date();
  return parseTimeToMinutes(time) <= now.getHours() * 60 + now.getMinutes();
};

export const getDoctorAvailability = async (req, res) => {
  try {
    const slots = await ensureDoctorAvailabilityWindow(req.params.id);

    res.json({
      success: true,
      slots: sortSlotsByDateTime(
        slots.filter(
          (slot) =>
            slot.date > toDateString() ||
            !isPastSlot(slot.date, slot.time)
        )
      ),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addDoctorAvailabilitySlot = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    if (isPastSlot(date, time)) {
      return res.status(400).json({ message: "Cannot create a past slot" });
    }

    const existingSlot = await Slot.findOne({ doctorId, date, time });

    if (existingSlot?.isBooked || existingSlot?.status === "booked") {
      return res.status(400).json({ message: "This slot is already booked" });
    }

    const slot = existingSlot
      ? await Slot.findByIdAndUpdate(
          existingSlot._id,
          { isBooked: false, status: "available" },
          { new: true }
        )
      : await Slot.create({
          doctorId,
          date,
          time,
          isBooked: false,
          status: "available",
        });

    res.status(201).json({ success: true, slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctorAvailabilitySlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { status } = req.body;

    if (!["available", "blocked"].includes(status)) {
      return res.status(400).json({ message: "Invalid slot status" });
    }

    const slot = await Slot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.isBooked || slot.status === "booked") {
      return res.status(400).json({ message: "Booked slots cannot be changed" });
    }

    slot.status = status;
    slot.isBooked = false;
    await slot.save();

    res.json({ success: true, slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientFacingSlots = async (req, res) => {
  try {
    const slots = await ensureDoctorAvailabilityWindow(req.params.id);

    res.json({
      success: true,
      slots: filterVisiblePatientSlots(slots),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
