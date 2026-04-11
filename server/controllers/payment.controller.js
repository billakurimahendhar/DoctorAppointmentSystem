import crypto from "crypto";
import { razorpayInstance } from "../config/razorpay.js";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import { createNotifications } from "../utils/notify.js";

const getMissingRazorpayEnv = () => {
  const missing = [];

  if (!process.env.RAZORPAY_KEY_ID) {
    missing.push("RAZORPAY_KEY_ID");
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    missing.push("RAZORPAY_KEY_SECRET");
  }

  return missing;
};

// 🧾 1️⃣ Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const missingEnv = getMissingRazorpayEnv();
    if (missingEnv.length) {
      return res.status(500).json({
        success: false,
        message: `Missing Razorpay configuration: ${missingEnv.join(", ")}`,
      });
    }
   console.log("Creating Razorpay order with data:", req.body); // Debug log
    const { amount, appointmentId } = req.body;
    const normalizedAmount = Number(amount);

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "appointmentId is required" });
    }

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "A valid amount is required" });
    }

    const options = {
      amount: Math.round(normalizedAmount * 100),
      currency: "INR",
      receipt: `receipt_${appointmentId}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 💳 2️⃣ Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const missingEnv = getMissingRazorpayEnv();
    if (missingEnv.length) {
      return res.status(500).json({
        success: false,
        message: `Missing Razorpay configuration: ${missingEnv.join(", ")}`,
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "appointmentId is required" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ success: false, message: "Invalid signature" });

    // Update appointment payment
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        paymentMode: "online",
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
      },
      {
        new: true,
      }
    );

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    if (appointment) {
      const [doctor, patient] = await Promise.all([
        Doctor.findById(appointment.doctorId).lean(),
        Patient.findById(appointment.patientId).lean(),
      ]);

      await createNotifications([
        {
          recipientId: appointment.patientId,
          recipientRole: "patient",
          title: "Payment received",
          message: `Your payment for the appointment on ${appointment.date} at ${appointment.time} was successful.`,
          type: "payment",
          actionUrl: "/patient-appointments",
          email: patient?.email,
        },
        {
          recipientId: appointment.doctorId,
          recipientRole: "doctor",
          title: "Appointment paid online",
          message: `${patient?.name || "A patient"} completed online payment for the appointment on ${appointment.date} at ${appointment.time}.`,
          type: "payment",
          actionUrl: "/doctor/appointments",
          email: doctor?.email,
        },
      ]);
    }

    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
app.get("/test-razorpay", async (req, res) => {
  try {
    const response = await axios.get("https://api.razorpay.com");
    res.send("Razorpay reachable");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Cannot reach Razorpay");
  }
});
