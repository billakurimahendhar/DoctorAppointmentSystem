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
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-12 sm:px-6">
      <h2 className="mb-4 max-w-4xl text-center text-3xl font-extrabold text-blue-700 sm:text-4xl lg:text-5xl">
        Book Your Doctor Appointments Effortlessly
      </h2>

      <p className="mb-8 max-w-2xl text-center text-base text-gray-600 sm:text-lg">
        Connect with qualified doctors, schedule visits online, and track your health reports in one place.
      </p>

      {user ? (
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-center text-base text-gray-700 sm:text-lg">
            Welcome back, <span className="font-semibold text-blue-700">{user.name}</span>
          </h3>
          <button
            onClick={handleGoToDashboard}
            className="w-full rounded-lg bg-blue-700 px-6 py-3 text-white hover:bg-blue-800 sm:w-auto"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
          <Link
            to="/login"
            className="rounded-lg bg-blue-700 px-6 py-3 text-center text-white hover:bg-blue-800"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg border border-blue-700 bg-white px-6 py-3 text-center text-blue-700 hover:bg-blue-50"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
