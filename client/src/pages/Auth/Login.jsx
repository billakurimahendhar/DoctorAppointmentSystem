import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

export default function Login() {
  const { loginUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await loginUser(role, email, password);
    if (result.success) {
      const signedInRole = result.user?.role || role;
      navigate(
        signedInRole === "admin"
          ? "/admin-dashboard"
          : signedInRole === "doctor"
          ? "/doctor-dashboard"
          : "/patient-home"
      );
    }
  };

  const forgotPasswordLink = `/forgot-password?role=${role}${
    email ? `&email=${encodeURIComponent(email)}` : ""
  }`;
  const resendVerificationLink = `/verify-email?mode=resend&role=${role}${
    email ? `&email=${encodeURIComponent(email)}` : ""
  }`;

  return (
    <div className="form-shell">
      <form onSubmit={handleLogin} className="form-card">
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-700">Login</h1>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mb-4 w-full rounded border p-3"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded border p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {role !== "admin" && (
          <div className="mb-6 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <Link to={forgotPasswordLink} className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
            <Link to={resendVerificationLink} className="text-blue-600 hover:underline">
              Resend verification
            </Link>
          </div>
        )}

        <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
          Login
        </button>

        {role !== "admin" && (
          <p className="mt-4 text-center text-gray-500">
            Do not have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}
