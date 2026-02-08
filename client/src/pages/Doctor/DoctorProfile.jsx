import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/doctor/profile/${id}`)
      .then((res) => setDoctor(res.data.doctor))
      .catch((err) => console.error(err));
  }, [id]);

  if (!doctor)
    return (
      <div className="h-screen flex items-center justify-center text-blue-600">
        Loading doctor profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 text-center">
        <img
          src={
            doctor.profileImage ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt={doctor.name}
          className="w-36 h-36 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
        />

        <h1 className="text-3xl font-bold text-blue-700">{doctor.name}</h1>
        <p className="text-gray-600 mt-1">{doctor.qualification}</p>
        <p className="text-gray-700 mt-2 font-medium">
          🩺 Specialization: {doctor.specialization}
        </p>
        <p className="text-gray-700">👨‍⚕️ Experience: {doctor.experience} years</p>
        <p className="text-gray-700 mb-6">
          💰 Consultation Fee: ₹{doctor.feesPerConsultation}
        </p>

        <button
          onClick={() => navigate(`/doctors/${doctor._id}`)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          View Available Slots
        </button>
      </div>
    </div>
  );
}
