import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Patient from "../models/patient.model.js";
import generateToken from "../config/jwt.js";



export const registerPatient = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Patient.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const patient = await Patient.create({ name, email, password: hashedPassword });

    res.status(201).json({ success: true, message: "Patient registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) return res.status(400).json({ message: "Email not found" });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: patient._id, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      _id: patient._id,
      name: patient.name,
      email: patient.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
