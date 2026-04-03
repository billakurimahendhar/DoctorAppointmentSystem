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
    <div className="flex justify-center items-center min-h-screen  from-indigo-100 to-blue-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Login</h1>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-3 rounded w-full mb-4"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded w-full mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {role !== "admin" && (
          <div className="flex items-center justify-between text-sm mb-6">
            <Link to={forgotPasswordLink} className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
            <Link to={resendVerificationLink} className="text-blue-600 hover:underline">
              Resend verification
            </Link>
          </div>
        )}

        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700">
          Login
        </button>

        {role !== "admin" && (
        <p className="text-center mt-4 text-gray-500">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
        )}
      </form>
    </div>
  );
}
