import crypto from "crypto";
import { razorpayInstance } from "../config/razorpay.js";
import Appointment from "../models/appointment.model.js";

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
    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentMode: "online",
      paymentStatus: "paid",
    });

    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
