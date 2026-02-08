import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
