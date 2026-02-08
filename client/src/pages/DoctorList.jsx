import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/api/doctor").then((res) => setDoctors(res.data.doctors));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Available Doctors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div key={doc._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold">{doc.name}</h2>
            <p className="text-gray-600">{doc.specialization}</p>
            <p className="text-sm text-gray-500">{doc.experience} years experience</p>
            <Link
              to={`/doctors/${doc._id}`}
              className="inline-block mt-3 bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700"
            >
              View Slots
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
