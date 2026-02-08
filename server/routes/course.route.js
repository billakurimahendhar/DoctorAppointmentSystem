import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import Course from "../models/course.model.js";

const router = express.Router();

// setup multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST → upload a course
router.post("/:doctorId/upload", upload.single("video"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const { doctorId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No video uploaded" });
    }

    // upload video to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "video", folder: "doctor_courses" },
      async (error, result) => {
        if (error) return res.status(500).json({ success: false, message: error.message });

        // save to MongoDB
        const newCourse = await Course.create({
          doctorId,
          title,
          description,
          videoUrl: result.secure_url,
        });

        return res.status(201).json({
          success: true,
          message: "Course uploaded successfully",
          course: newCourse,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET → fetch all courses (for patients)
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().populate("doctorId", "name specialization");
    res.status(200).json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET → fetch doctor’s own courses
router.get("/:doctorId", async (req, res) => {
  try {
    const courses = await Course.find({ doctorId: req.params.doctorId });
    res.status(200).json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
