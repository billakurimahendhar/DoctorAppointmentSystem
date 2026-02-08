import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export default function Navbar() {
  const { user, logoutUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-700 text-white py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-wide">
          MediConnect
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          {/* Public Navbar */}
          {!user && (
            <>
              <a href="#about" className="hover:underline">
                About
              </a>
              <a href="#contact" className="hover:underline">
                Contact
              </a>
              <Link
                to="/login"
                className="bg-white text-blue-700 px-4 py-1 rounded-lg hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="border border-white px-4 py-1 rounded-lg hover:bg-white hover:text-blue-700"
              >
                Register
              </Link>
            </>
          )}

          {/* Doctor Navbar */}
          {user?.role === "doctor" && (
            <>
              <Link to="/doctor-home" className="hover:underline">
                Dashboard
              </Link>
              <Link to="/doctor-slots" className="hover:underline">
                Slots
              </Link>
              <Link to="/doctor-reports" className="hover:underline">
                Reports
              </Link>
              <Link to="/doctor-courses" className="hover:underline">
                Courses
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-700 px-4 py-1 rounded-lg hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          )}

          {/* Patient Navbar */}
          {user?.role === "patient" && (
            <>
              
              <Link to="/home" className="hover:underline">
                Home
              </Link>
              <Link to="/patient-reports" className="hover:underline">
                Reports
              </Link>
              <Link to="/patient-courses" className="hover:underline">
                HealthVideos
              </Link>
              <Link to="/doctors" className="hover:underline">
                Doctors
              </Link>
              <Link to="/patient-timeline" className="hover:underline">
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
