// client/src/pages/Doctor/DoctorHome.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DoctorHome() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [appointments, setAppointments] = useState([]);
  const [profileImage, setProfileImage] = useState(doctor?.profileImage || "");
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (doctor?._id) {
      fetchAppointments();
    }
  }, [doctor?._id]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/appointments/doctor/${doctor._id}`
      );
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        `http://localhost:4000/api/doctor/${doctor._id}/upload-photo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setProfileImage(res.data.profileImage);

      const updatedUser = { ...doctor, profileImage: res.data.profileImage };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setDoctor(updatedUser); // 🔥 refresh UI
    } catch (err) {
      alert("Upload failed");
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

  const activeAppointments = appointments.filter(
    (a) => a.status !== "completed"
  );
  const completedAppointments = appointments.filter(
    (a) => a.status === "completed"
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-blue-700 text-lg font-semibold animate-pulse">
          Loading appointments...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 md:p-10">
      {/* PROFILE HEADER */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={
              profileImage ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="Doctor"
            className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow"
          />

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-blue-700">
              Welcome back, Dr. {doctor?.name}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your appointments and patient reports
            </p>

            <label className="inline-block mt-4 cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm shadow">
              Change Profile Photo
              <input type="file" hidden onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>
      </div>

      {/* ACTIVE APPOINTMENTS */}
      <div className="max-w-6xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">
          Active Appointments
        </h2>

        {activeAppointments.length === 0 ? (
          <p className="text-gray-500 text-center">No active appointments.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAppointments.map((a) => (
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
                </div>

                <button
                  onClick={() =>
                    navigate(`/doctor/upload-report/${a._id}`, {
                      state: { appointment: a },
                    })
                  }
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Upload Report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HISTORY TOGGLE */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full text-sm font-medium transition"
        >
          {showHistory ? "Hide Previous History" : "View Previous History"}
        </button>
      </div>

      {/* HISTORY SECTION */}
      {showHistory && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
            Appointment History
          </h2>

          {completedAppointments.length === 0 ? (
            <p className="text-gray-500 text-center">
              No completed appointments yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedAppointments.map((a) => (
                <div
                  key={a._id}
                  className="bg-gray-50 rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-700 text-lg">
                      {a.patientId?.name}
                    </h3>
                    {statusBadge(a.status)}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📅 Date: {a.date}</p>
                    <p>⏰ Time: {a.time}</p>
                  </div>

                  <button
                    disabled
                    className="mt-4 w-full bg-gray-300 text-gray-600 py-2 rounded-lg text-sm"
                  >
                    Report Uploaded
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
