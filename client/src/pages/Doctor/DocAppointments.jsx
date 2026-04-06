import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function DocAppointments() {
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem("user"));

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctor?._id) fetchAppointments();
  }, [doctor?._id]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get(`/appointments/doctor/${doctor._id}`);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      booked: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${map[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-blue-50">
        <div className="text-blue-700 text-lg font-semibold animate-pulse">
          Loading appointments...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  from-blue-50 via-white to-indigo-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">
          My Appointments
        </h1>

        {appointments.length === 0 ? (
          <p className="text-center text-gray-500">No appointments found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-blue-700 text-lg">
                    {a.patientId?.name}
                  </h3>
                  {statusBadge(a.status)}
                </div>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>📅 Date: {a.date}</p>
                  <p>⏰ Time: {a.time}</p>
                  <p>📍 Reason: {a.reason || "General Consultation"}</p>
                </div>

                {a.status !== "completed" && a.status !== "cancelled" && (
                  <button
                    onClick={() =>
                      navigate(`/doctor/upload-report/${a._id}`, {
                        state: { appointment: a },
                      })
                    }
                    className="w-full mb-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Upload Report
                  </button>
                )}

                <button
                  onClick={() =>
                    navigate("/doctor-reports", {
                      state: { patientId: a.patientId?._id, appointmentId: a._id },
                    })
                  }
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  View Patient Reports
                </button>

                {a.status === "completed" && (
                  <button
                    disabled
                    className="w-full mt-2 bg-gray-300 text-gray-600 py-2 rounded-lg text-sm"
                  >
                    Report Uploaded
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
