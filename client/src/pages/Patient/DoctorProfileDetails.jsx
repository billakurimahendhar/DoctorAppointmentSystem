import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";

const renderStars = (value) =>
  Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={index < Math.round(value) ? "text-amber-400" : "text-slate-300"}>
      ★
    </span>
  ));

export default function DoctorProfileDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await api.get(`/doctor/profile/${id}`);
        setDoctor(data.doctor);
        setReviews(data.reviews || []);
      } catch (error) {
        console.error("Failed to fetch doctor profile", error);
      }
    };

    fetchDoctor();
  }, [id]);

  if (!doctor) {
    return (
      <div className="flex h-screen items-center justify-center text-blue-600">
        Loading doctor profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <img
              src={
                doctor.profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={doctor.name}
              className="h-28 w-28 rounded-full object-cover"
            />

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">
                Dr. {doctor.name}
              </h1>
              <p className="mt-1 text-slate-500">{doctor.qualification}</p>
              <p className="mt-1 text-slate-500">{doctor.specialization}</p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span>{renderStars(doctor.averageRating || 0)}</span>
                <span>
                  {(doctor.averageRating || 0).toFixed(1)} from{" "}
                  {doctor.reviewCount || 0} reviews
                </span>
                <span>{doctor.experience || 0} years experience</span>
                <span>Fee Rs. {doctor.feesPerConsultation || 0}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/doctors/${doctor._id}`)}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              View available slots
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">
            Patient reviews
          </h2>

          <div className="mt-5 space-y-4">
            {reviews.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                No reviews yet.
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {review.patientId?.name || "Patient"}
                      </p>
                      <p className="text-sm">{renderStars(review.rating)}</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {review.review && (
                    <p className="mt-3 text-sm text-slate-600">{review.review}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
