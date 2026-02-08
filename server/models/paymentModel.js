import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "appointment", required: true },
    amount: { type: Number, required: true },
    mode: { type: String, enum: ["online", "offline"], required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    transactionId: { type: String },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

const paymentModel = mongoose.models.payment || mongoose.model("payment", paymentSchema);
export default paymentModel;
