import Appointment from "../models/appointment.model.js";
import Review from "../models/review.model.js";

export const createOrUpdateReview = async (req, res) => {
  try {
    const { doctorId, patientId, appointmentId, rating, review = "" } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (String(appointment.patientId) !== String(patientId)) {
      return res.status(403).json({ message: "You can only review your own appointment" });
    }

    if (String(appointment.doctorId) !== String(doctorId)) {
      return res.status(400).json({ message: "Doctor mismatch for this appointment" });
    }

    if (appointment.status !== "completed") {
      return res.status(400).json({ message: "Review is allowed only after completion" });
    }

    const savedReview = await Review.findOneAndUpdate(
      { appointmentId },
      {
        doctorId,
        patientId,
        appointmentId,
        rating: Number(rating),
        review: review.trim(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({ success: true, review: savedReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const reviews = await Review.find({ doctorId })
      .populate("patientId", "name")
      .sort({ createdAt: -1 });

    const reviewCount = reviews.length;
    const averageRating =
      reviewCount === 0
        ? 0
        : Number(
            (
              reviews.reduce((sum, item) => sum + item.rating, 0) / reviewCount
            ).toFixed(1)
          );

    res.json({
      success: true,
      averageRating,
      reviewCount,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
