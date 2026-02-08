import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function DoctorList() {
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-blue-600 text-lg">
        Loading doctors...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-10">
        Available Doctors 👨‍⚕️👩‍⚕️
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {doctors.map((doc) => (
          <div key={doc._id} className="bg-white rounded-2xl shadow-md p-6 text-center border">
            <img
              src={doc.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt={doc.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            <h2 className="text-xl font-semibold text-blue-800">{doc.name}</h2>
            <p className="text-gray-600">{doc.specialization}</p>
            <p className="text-sm text-gray-500">{doc.experience} yrs experience</p>

            <Link
              to={`/doctors/${doc._id}`}
              className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              View Slots
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
