import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleGoToDashboard = () => {
    if (user?.role === "doctor") navigate("/doctor-home");
    else if (user?.role === "patient") navigate("/patient-home");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <h2 className="text-4xl font-extrabold text-blue-700 text-center mb-4">
        Book Your Doctor Appointments Effortlessly
      </h2>

      <p className="text-gray-600 text-center max-w-2xl mb-8">
        Connect with qualified doctors, schedule visits online, and track your health reports in one place.
      </p>

      {/* Conditional Rendering */}
      {user ? (
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg text-gray-700">
            Welcome back, <span className="font-semibold text-blue-700">{user.name}</span> 👋
          </h3>
          <button
            onClick={handleGoToDashboard}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            to="/login"
            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-white text-blue-700 px-6 py-3 rounded-lg border border-blue-700 hover:bg-blue-50"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
