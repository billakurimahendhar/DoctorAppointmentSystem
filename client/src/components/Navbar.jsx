import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AppContext } from "../context/AppContext";
import logo from "../assets/logo.svg";

export default function Navbar() {
  const { user, logoutUser } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = useMemo(() => {
    if (!user) {
      return [
        { to: "/login", label: "Login" },
        { to: "/register", label: "Register" },
      ];
    }

    if (user.role === "doctor") {
      return [
        { to: "/doctor-dashboard", label: "Dashboard" },
        { to: "/doctor-slots", label: "Availability" },
        { to: "/doctor/appointments", label: "Appointments" },
        { to: "/doctor-courses", label: "Health Videos" },
        { to: "/notifications", label: "Notifications" },
      ];
    }

    if (user.role === "patient") {
      return [
        { to: "/patient-home", label: "Home" },
        { to: "/patient-appointments", label: "Appointments" },
        { to: "/patient-reports", label: "Reports" },
        { to: "/patient-courses", label: "Health Videos" },
        { to: "/doctors", label: "Doctors" },
        { to: "/patient-timeline", label: "Timeline" },
        { to: "/notifications", label: "Notifications" },
      ];
    }

    return [
      { to: "/admin-dashboard", label: "Admin" },
      { to: "/notifications", label: "Notifications" },
    ];
  }, [user]);

  const profileLink =
    user?.role === "doctor"
      ? "/doctor-home"
      : user?.role === "patient"
      ? "/patient-home"
      : user?.role === "admin"
      ? "/admin-dashboard"
      : "/";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMenuOpen(false);
    logoutUser();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const desktopLinkClass = (path) =>
    isActive(path)
      ? "font-semibold text-yellow-300"
      : "text-white/90 hover:text-white";

  const mobileLinkClass = (path) =>
    isActive(path)
      ? "bg-blue-800 text-yellow-300"
      : "bg-blue-600/20 text-white hover:bg-blue-600/30";

  return (
    <nav className="sticky top-0 z-50 bg-blue-700 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="group flex min-w-0 items-center gap-2">
          <img
            src={logo}
            alt="MediConnect Logo"
            className="h-10 w-auto transition-transform duration-300 group-hover:scale-110"
          />
          <span className="hidden truncate text-xl font-bold tracking-wide sm:block lg:text-2xl">
            MediConnect
          </span>
        </Link>

        <div className="hidden items-center gap-4 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={desktopLinkClass(item.to)}
            >
              {item.label}
            </Link>
          ))}

          {user?.role === "doctor" && (
            <Link to={profileLink} className="flex items-center gap-2">
              <img
                src={
                  user.profileImage ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Doctor"
                className="h-9 w-9 rounded-full border-2 border-white object-cover transition-transform duration-200 hover:scale-110"
              />
            </Link>
          )}

          {!user ? (
            <Link
              to="/register"
              className="rounded-lg border border-white px-4 py-2 font-medium hover:bg-white hover:text-blue-700"
            >
              Register
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="rounded-lg bg-white px-4 py-2 font-medium text-blue-700 transition hover:bg-gray-100"
            >
              Logout
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          {user && (
            <Link to={profileLink} className="max-w-[160px] truncate text-sm font-medium">
              {user.name}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg border border-white/30 p-2 transition hover:bg-blue-800"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-blue-700/95 px-4 py-4 shadow-lg backdrop-blur lg:hidden sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            {user && (
              <Link
                to={profileLink}
                className="flex items-center gap-3 rounded-2xl bg-blue-800/60 p-3"
              >
                <img
                  src={
                    user.profileImage ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={user.name || "User"}
                  className="h-10 w-10 rounded-full border border-white/40 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.name}</p>
                  <p className="text-sm capitalize text-blue-100">{user.role}</p>
                </div>
              </Link>
            )}

            <div className="grid gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${mobileLinkClass(
                    item.to
                  )}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {!user ? (
              <Link
                to="/register"
                className="rounded-xl border border-white bg-white px-4 py-3 text-center font-medium text-blue-700"
              >
                Create account
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="rounded-xl bg-white px-4 py-3 font-medium text-blue-700 transition hover:bg-gray-100"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
