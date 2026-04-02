import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import api from "../../lib/api";

const badgeStyle = {
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  booked: "bg-blue-100 text-blue-700",
};

export default function MedicalTimeline() {
  const { user } = useContext(AppContext);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const { data } = await api.get(`/appointments/patient/${user._id}/timeline`);
        setTimeline(data.timeline || []);
      } catch (error) {
        console.error("Failed to fetch timeline", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchTimeline();
    }
  }, [user?._id]);

  const filteredTimeline =
    filter === "all"
      ? timeline
      : timeline.filter((item) => item.status === filter);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-blue-600">
        Loading timeline...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Medical Timeline
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Follow your appointment history, diagnoses, medicines, and
                review-ready completed visits in one place.
              </p>
            </div>

            <select
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All appointments</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTimeline.map((appointment) => (
            <div
              key={appointment._id}
              className="rounded-3xl bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      appointment.doctorId?.profileImage ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={appointment.doctorId?.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Dr. {appointment.doctorId?.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {appointment.doctorId?.specialization}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    badgeStyle[appointment.status] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <p>Date: {appointment.date}</p>
                <p>Time: {appointment.time}</p>
                {appointment.diseases?.length > 0 && (
                  <p>Diseases: {appointment.diseases.join(", ")}</p>
                )}
                {appointment.medicines?.length > 0 && (
                  <p>Medicines: {appointment.medicines.join(", ")}</p>
                )}
                {appointment.review && (
                  <p>
                    Review: {appointment.review.rating}/5
                    {appointment.review.review
                      ? ` - ${appointment.review.review}`
                      : ""}
                  </p>
                )}
              </div>
            </div>
          ))}

          {filteredTimeline.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
              No appointments in this view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
