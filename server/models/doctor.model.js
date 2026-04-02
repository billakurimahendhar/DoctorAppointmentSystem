import mongoose from "mongoose";



const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qualification: { type: String },
    specialization: { type: String },
    experience: { type: Number },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    feesPerConsultation: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },

    // ✅ NEW FIELD
    profileImage: { type: String, default: "" },
    emailVerified: { type: Boolean },
    emailVerifiedAt: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
