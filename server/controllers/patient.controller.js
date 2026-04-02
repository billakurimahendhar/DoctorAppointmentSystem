import bcrypt from "bcryptjs";
import Patient from "../models/patient.model.js";
import generateToken from "../config/jwt.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/authEmail.js";
import {
  assignEmailVerificationToken,
  assignPasswordResetToken,
  clearEmailVerificationToken,
  clearPasswordResetToken,
  hashToken,
} from "../utils/authTokens.js";

export const registerPatient = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Patient.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const patient = new Patient({
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
    });

    const verificationToken = assignEmailVerificationToken(patient);
    await patient.save();

    await sendVerificationEmail({
      email: patient.email,
      name: patient.name,
      role: "patient",
      token: verificationToken,
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully. Please verify your email before logging in.",
      requiresEmailVerification: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(400).json({ message: "Email not found" });
    }

    if (patient.emailVerified === false) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
        requiresVerification: true,
      });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(patient._id, "patient"),
      _id: patient._id,
      name: patient.name,
      email: patient.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyPatientEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const patient = await Patient.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!patient) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    patient.emailVerified = true;
    patient.emailVerifiedAt = new Date();
    clearEmailVerificationToken(patient);
    await patient.save();

    res.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resendPatientVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const patient = await Patient.findOne({ email });

    if (patient && patient.emailVerified !== true) {
      const verificationToken = assignEmailVerificationToken(patient);
      await patient.save();

      await sendVerificationEmail({
        email: patient.email,
        name: patient.name,
        role: "patient",
        token: verificationToken,
      });
    }

    res.json({
      success: true,
      message: "If your account exists and is not verified, a new verification email has been sent.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPatientPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const patient = await Patient.findOne({ email });

    if (patient) {
      const resetToken = assignPasswordResetToken(patient);
      await patient.save();

      await sendPasswordResetEmail({
        email: patient.email,
        name: patient.name,
        role: "patient",
        token: resetToken,
      });
    }

    res.json({
      success: true,
      message: "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPatientPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    const patient = await Patient.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!patient) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    patient.password = await bcrypt.hash(password, 10);
    clearPasswordResetToken(patient);
    await patient.save();

    res.json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
