import Review from "../models/review.model.js";

export const getDoctorRatingsMap = async (doctorIds = []) => {
  if (!doctorIds.length) {
    return new Map();
  }

  const ratings = await Review.aggregate([
    {
      $match: {
        doctorId: { $in: doctorIds },
      },
    },
    {
      $group: {
        _id: "$doctorId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    ratings.map((entry) => [
      String(entry._id),
      {
        averageRating: Number((entry.averageRating || 0).toFixed(1)),
        reviewCount: entry.reviewCount || 0,
      },
    ])
  );
};

export const enrichDoctorWithRating = (doctor, ratingsMap) => {
  const doctorObject =
    typeof doctor.toObject === "function" ? doctor.toObject() : { ...doctor };
  const rating = ratingsMap.get(String(doctorObject._id)) || {
    averageRating: 0,
    reviewCount: 0,
  };

  return {
    ...doctorObject,
    averageRating: rating.averageRating,
    reviewCount: rating.reviewCount,
  };
};
