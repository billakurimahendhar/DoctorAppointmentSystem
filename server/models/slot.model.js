import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: String, required: true },    // e.g. "2025-11-09"
  time: { type: String, required: true },    // e.g. "10:30 AM"
  isBooked: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["available", "booked", "blocked"],
    default: "available",
  },
});

export default mongoose.model("Slot", slotSchema);
