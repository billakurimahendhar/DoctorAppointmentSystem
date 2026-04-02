import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, required: true },
    recipientRole: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["general", "appointment", "report", "approval", "payment"],
      default: "general",
    },
    actionUrl: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
