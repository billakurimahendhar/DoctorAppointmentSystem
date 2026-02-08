import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function PatientHome() {
  const patient = JSON.parse(localStorage.getItem("user"));
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/doctor");
        setDoctors(res.data.doctors || []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-8 text-center">
        Welcome, {patient?.name}! 💊
      </h1>

      <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">
        Available Doctors
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading doctors...</p>
      ) : doctors.length === 0 ? (
        <p className="text-center text-gray-500">No doctors available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-blue-700">{doc.name}</h3>
                <p className="text-sm text-gray-600">{doc.specialization}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {doc.qualification} • {doc.experience || 0} yrs experience
                </p>
              </div>

              <Link
                to={`/doctors/${doc._id}`}
                className="mt-4 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
              >
                View Slots
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
