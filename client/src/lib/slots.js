const APP_TIME_ZONE = "Asia/Kolkata";

const slotDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  hourCycle: "h23",
});

const getSlotDateTimeParts = (value = new Date()) =>
  Object.fromEntries(
    slotDateTimeFormatter
      .formatToParts(new Date(value))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

export const getCurrentSlotContext = (value = new Date()) => {
  const parts = getSlotDateTimeParts(value);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour,
    minute,
    minutes: hour * 60 + minute,
  };
};

export const parseTimeToMinutes = (time = "00:00") => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const isPastSlot = (date, time, now = new Date()) => {
  const currentSlotContext = getCurrentSlotContext(now);

  if (date < currentSlotContext.date) {
    return true;
  }

  if (date > currentSlotContext.date) {
    return false;
  }

  return parseTimeToMinutes(time) <= currentSlotContext.minutes;
};

export const filterUpcomingSlots = (slots = [], now = new Date()) =>
  slots.filter((slot) => !isPastSlot(slot.date, slot.time, now));
