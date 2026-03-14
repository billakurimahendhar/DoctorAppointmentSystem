import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";

import healthRoute from "./routes/health.route.js";
import patientRoute from "./routes/patient.route.js";
import doctorRoute from "./routes/doctor.route.js";
import appointmentRoute from "./routes/appointment.route.js";
import reportRoute from "./routes/report.route.js";
import courseRoute from "./routes/course.route.js";
import paymentRoute from "./routes/payment.route.js";

const app = express();
const port = process.env.PORT || 4000;

// connect DB
connectDB();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://doctor-appointment-system-x6xp.vercel.app"
  ],
  methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Doctor Appointment System API is running...");
});

app.use("/api/health", healthRoute);
app.use("/api/patient", patientRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/appointments", appointmentRoute);
app.use("/api/reports", reportRoute);
app.use("/api/courses", courseRoute);
app.use("/api/payment", paymentRoute);

app.listen(port, () => {
  console.log(`🚀 Server started on PORT: ${port}`);
});