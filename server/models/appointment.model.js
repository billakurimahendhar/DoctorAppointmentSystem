import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
    },
    paymentMode: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    paymentStatus: {
      type: String,
      enum: ["pending","unpaid", "paid"],
      default: "unpaid",
    },
    paymentId: {
      type: String, // Razorpay payment ID (for online)
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
