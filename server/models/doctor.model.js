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

    // ✅ NEW FIELD
    profileImage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
