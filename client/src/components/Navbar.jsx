import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export default function Navbar() {
  const { user, logoutUser } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? "text-yellow-300 font-semibold"
      : "hover:text-gray-200";

  return (
    <nav className="bg-blue-700 text-white py-3 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-wide">
          MediConnect
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {/* 🌍 Public Navbar */}
          {!user && (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link
                to="/register"
                className="border border-white px-4 py-1 rounded-lg hover:bg-white hover:text-blue-700"
              >
                Register
              </Link>
            </>
          )}

          {/* 👨‍⚕️ Doctor Navbar */}
          {user?.role === "doctor" && (
            <>
              <Link to="/doctor-home" className={isActive("/doctor-home")}>
                Dashboard
              </Link>
              <Link to="/doctor/appointments" className={isActive("/doctor/appointments")}>
                My Appointments
              </Link>
              
              <Link to="/doctor-courses" className={isActive("/doctor-courses")}>
                Courses
              </Link>

              {/* Profile Image */}
              <Link to={`/doctor-profile-edit/${user._id}`} className="flex items-center gap-2">
                <img
                  src={
                    user.profileImage ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="Doctor"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover"
                />
              </Link>

              <button
                onClick={handleLogout}
                className="bg-white text-blue-700 px-4 py-1 rounded-lg hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          )}

          {/* 🧑‍🤝‍🧑 Patient Navbar */}
          {user?.role === "patient" && (
            <>
              <Link to="/patient-home" className={isActive("/patient-home")}>
                Home
              </Link>
              <Link to="/patient-reports" className={isActive("/patient-reports")}>
                Reports
              </Link>
              <Link to="/patient-courses" className={isActive("/patient-courses")}>
                Health Videos
              </Link>
              <Link to="/doctors" className={isActive("/doctors")}>
                Doctors
              </Link>
              <Link to="/patient-timeline" className={isActive("/patient-timeline")}>
                Timeline
              </Link>

              <button
                onClick={handleLogout}
                className="bg-white text-blue-700 px-4 py-1 rounded-lg hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
