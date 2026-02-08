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
      navigate(role === "doctor" ? "/doctor-home" : "/patient-home");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-100 to-blue-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Login</h1>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-3 rounded w-full mb-4"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
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
          className="border p-3 rounded w-full mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700">
          Login
        </button>

        <p className="text-center mt-4 text-gray-500">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
