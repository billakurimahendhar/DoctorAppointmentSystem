import { useEffect, useState } from "react";
import axios from "axios";

export default function PatientTimeline() {
  const patient = JSON.parse(localStorage.getItem("user"));
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/appointments/patient/${patient._id}/timeline`)
      .then((res) => setTimeline(res.data.timeline || []))
      .finally(() => setLoading(false));
  }, [patient._id]);

  const filteredTimeline =
    filter === "all" ? timeline : timeline.filter((t) => t.status === filter);

  const badgeStyle = (status) => {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-blue-100 text-blue-700";
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-blue-600">
        Loading timeline...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
        My Medical Timeline 🕒
      </h1>

      {/* 🔽 FILTER */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-end">
        <select
          className="border border-blue-300 px-4 py-2 rounded-lg text-blue-700 shadow-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Appointments</option>
          <option value="booked">Booked</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* 📦 CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 max-w-5xl mx-auto">
        {filteredTimeline.map((a) => (
          <div
            key={a._id}
            className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition"
          >
            {/* 🧑‍⚕️ Doctor Info Row */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={
                  a.doctorId?.profileImage ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt={a.doctorId?.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-200 shadow"
              />

              <div className="flex-1">
                <h2 className="font-semibold text-lg text-blue-800">
                  Dr. {a.doctorId?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {a.doctorId?.specialization}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeStyle(
                  a.status
                )}`}
              >
                {a.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <p>📅 {a.date}</p>
              <p>⏰ {a.time}</p>
            </div>

            {a.diseases?.length > 0 && (
              <p className="text-sm mt-3 text-gray-600">
                🩺 <span className="font-medium">Diseases:</span>{" "}
                {a.diseases.join(", ")}
              </p>
            )}

            {a.medicines?.length > 0 && (
              <p className="text-sm mt-1 text-gray-600">
                💊 <span className="font-medium">Medicines:</span>{" "}
                {a.medicines.join(", ")}
              </p>
            )}
          </div>
        ))}

        {filteredTimeline.length === 0 && (
          <p className="text-center text-gray-500 col-span-full">
            No appointments in this category.
          </p>
        )}
      </div>
    </div>
  );
}
