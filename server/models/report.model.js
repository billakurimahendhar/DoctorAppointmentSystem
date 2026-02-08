import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },

    diseaseName: { type: String, required: true }, // 👈 important
    testType: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String },

    prescribedMedicines: [{ type: String }],
    notes: { type: String },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
