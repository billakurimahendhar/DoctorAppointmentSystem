import express from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
app.get("/test-razorpay", async (req, res) => {
  try {
    const response = await axios.get("https://api.razorpay.com");
    res.send("Razorpay reachable");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Cannot reach Razorpay");
  }
});


export default router;
