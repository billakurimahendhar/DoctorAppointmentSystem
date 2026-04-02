import bcrypt from "bcryptjs";
import Doctor from "../models/doctor.model.js";
import generateToken from "../config/jwt.js";
import cloudinary from "../config/cloudinary.js";
import Review from "../models/review.model.js";
import { getDoctorRatingsMap, enrichDoctorWithRating } from "../utils/doctorRatings.js";
import { createNotification } from "../utils/notify.js";
import { ensureDoctorAvailabilityWindow } from "../utils/slots.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/authEmail.js";
import {
  assignEmailVerificationToken,
  assignPasswordResetToken,
  clearEmailVerificationToken,
  clearPasswordResetToken,
  hashToken,
} from "../utils/authTokens.js";

export const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      qualification,
      specialization,
      experience,
      feesPerConsultation = 0,
    } = req.body;

    const existing = await Doctor.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      qualification,
      specialization,
      experience,
      feesPerConsultation,
      isApproved: false,
      approvalStatus: "pending",
      emailVerified: false,
    });

    const verificationToken = assignEmailVerificationToken(doctor);
    await doctor.save();

    await ensureDoctorAvailabilityWindow(doctor._id);

    await sendVerificationEmail({
      email: doctor.email,
      name: doctor.name,
      role: "doctor",
      token: verificationToken,
    });

    await createNotification({
      recipientId: "admin",
      recipientRole: "admin",
      title: "Doctor approval pending",
      message: `${doctor.name} registered and is waiting for approval.`,
      type: "approval",
      actionUrl: "/admin-dashboard",
      email: process.env.ADMIN_EMAIL,
    });

    res.status(201).json({
      success: true,
      message: "Doctor registered successfully. Please verify your email. Approval is pending.",
      requiresEmailVerification: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (doctor.emailVerified === false) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
        requiresVerification: true,
      });
    }

    if (doctor.approvalStatus === "rejected") {
      return res.status(401).json({
        message: doctor.rejectionReason
          ? `Account rejected: ${doctor.rejectionReason}`
          : "Your account has been rejected",
      });
    }

    if (!doctor.isApproved) {
      return res.status(401).json({ message: "You are not approved yet" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(doctor._id, "doctor"),
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      profileImage: doctor.profileImage,
      feesPerConsultation: doctor.feesPerConsultation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyDoctorEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const doctor = await Doctor.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!doctor) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    doctor.emailVerified = true;
    doctor.emailVerifiedAt = new Date();
    clearEmailVerificationToken(doctor);
    await doctor.save();

    res.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendDoctorVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const doctor = await Doctor.findOne({ email });

    if (doctor && doctor.emailVerified !== true) {
      const verificationToken = assignEmailVerificationToken(doctor);
      await doctor.save();

      await sendVerificationEmail({
        email: doctor.email,
        name: doctor.name,
        role: "doctor",
        token: verificationToken,
      });
    }

    res.json({
      success: true,
      message: "If your account exists and is not verified, a new verification email has been sent.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotDoctorPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const doctor = await Doctor.findOne({ email });

    if (doctor) {
      const resetToken = assignPasswordResetToken(doctor);
      await doctor.save();

      await sendPasswordResetEmail({
        email: doctor.email,
        name: doctor.name,
        role: "doctor",
        token: resetToken,
      });
    }

    res.json({
      success: true,
      message: "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetDoctorPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    const doctor = await Doctor.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!doctor) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    doctor.password = await bcrypt.hash(password, 10);
    clearPasswordResetToken(doctor);
    await doctor.save();

    res.json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listDoctors = async (_req, res) => {
  try {
    const doctors = await Doctor.find(
      { isApproved: true },
      "name specialization qualification experience profileImage feesPerConsultation"
    ).sort({ name: 1 });

    const ratingsMap = await getDoctorRatingsMap(doctors.map((doctor) => doctor._id));

    res.json({
      success: true,
      doctors: doctors.map((doctor) => enrichDoctorWithRating(doctor, ratingsMap)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadDoctorPhoto = async (req, res) => {
  try {
    const doctorId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: "mediconnect/doctors" },
      async (error, uploadResult) => {
        if (error) {
          return res.status(500).json({ message: error.message });
        }

        const doctor = await Doctor.findByIdAndUpdate(
          doctorId,
          { profileImage: uploadResult.secure_url },
          { new: true }
        );

        res.json({
          success: true,
          message: "Profile photo updated",
          profileImage: doctor.profileImage,
        });
      }
    );

    stream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select(
      "name qualification specialization experience feesPerConsultation profileImage"
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const ratingsMap = await getDoctorRatingsMap([doctor._id]);
    const reviews = await Review.find({ doctorId: doctor._id })
      .populate("patientId", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      doctor: enrichDoctorWithRating(doctor, ratingsMap),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
