import express from "express";
import {
  createOrUpdateReview,
  getDoctorReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", createOrUpdateReview);
router.get("/doctor/:doctorId", getDoctorReviews);

export default router;
