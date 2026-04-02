import Slot from "../models/slot.model.js";

const SLOT_START_HOUR = 10;
const SLOT_END_HOUR = 22;

export const formatTime = (hour, minute) =>
  `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

export const generateSlotTimes = () => {
  const times = [];

  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour += 1) {
    times.push(formatTime(hour, 0));
    times.push(formatTime(hour, 30));
  }

  return times;
};

export const toDateString = (value = new Date()) =>
  new Date(value).toISOString().split("T")[0];

export const parseTimeToMinutes = (time = "00:00") => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const sortSlotsByDateTime = (slots = []) =>
  [...slots].sort((a, b) => {
    if (a.date === b.date) {
      return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
    }

    return a.date.localeCompare(b.date);
  });

export const ensureDoctorAvailabilityWindow = async (doctorId, days = 7) => {
  const today = new Date();
  const todayStr = toDateString(today);
  const targetDates = [];

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    targetDates.push(toDateString(date));
  }

  await Slot.updateMany(
    { doctorId, isBooked: true, status: { $ne: "booked" } },
    { $set: { status: "booked" } }
  );

  await Slot.deleteMany({
    doctorId,
    isBooked: false,
    date: { $lt: todayStr },
  });

  const existingSlots = await Slot.find({
    doctorId,
    date: { $in: targetDates },
  }).select("date time");

  const existingKeys = new Set(
    existingSlots.map((slot) => `${slot.date}|${slot.time}`)
  );

  const slotsToInsert = [];

  for (const date of targetDates) {
    for (const time of generateSlotTimes()) {
      const key = `${date}|${time}`;

      if (!existingKeys.has(key)) {
        slotsToInsert.push({
          doctorId,
          date,
          time,
          isBooked: false,
          status: "available",
        });
      }
    }
  }

  if (slotsToInsert.length > 0) {
    await Slot.insertMany(slotsToInsert, { ordered: false }).catch(() => null);
  }

  return Slot.find({ doctorId, date: { $gte: todayStr } }).lean();
};

export const filterVisiblePatientSlots = (slots = [], now = new Date()) => {
  const todayStr = toDateString(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return sortSlotsByDateTime(
    slots.filter((slot) => {
      const isAvailable = slot.status === "available" && !slot.isBooked;

      if (!isAvailable) {
        return false;
      }

      if (slot.date > todayStr) {
        return true;
      }

      if (slot.date < todayStr) {
        return false;
      }

      return parseTimeToMinutes(slot.time) > currentMinutes;
    })
  );
};
