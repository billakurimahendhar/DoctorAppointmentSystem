import crypto from "crypto";
import { razorpayInstance } from "../config/razorpay.js";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import { createNotifications } from "../utils/notify.js";

// 🧾 1️⃣ Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { amount, appointmentId } = req.body;

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${appointmentId}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 💳 2️⃣ Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ success: false, message: "Invalid signature" });

    // Update appointment payment
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
      paymentMode: "online",
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
    });

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
