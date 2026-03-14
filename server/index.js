import dotenv from "dotenv";
dotenv.config();  
import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";
connectDB();

import healthRoute from "./routes/health.route.js";
import patientRoute from "./routes/patient.route.js";
import doctorRoute from "./routes/doctor.route.js";
import appointmentRoute from "./routes/appointment.route.js";
import reportRoute from "./routes/report.route.js";
import courseRoute from "./routes/course.route.js";
import paymentRoute from "./routes/payment.route.js";






// app config
const app = express();
const port = process.env.PORT || 4000;

// test env load
console.log("🧩 ENV loaded — PORT:", port);

// connect DB
connectDB();

// middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://doctor-appointment-system-x6xp.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.get("/", (req, res) => res.send("Doctor Appointment System API is running..."));

// routes
app.use("/api/health", healthRoute);
app.use("/api/patient", patientRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/appointments", appointmentRoute);
app.use("/api/reports", reportRoute);
app.use("/api/courses", courseRoute);
app.use("/api/payment", paymentRoute);

// start server
try {
  app.listen(port, () => console.log(`🚀 Server started on PORT: ${port}`));
} catch (err) {
  console.error("❌ Server failed to start:", err);
}

