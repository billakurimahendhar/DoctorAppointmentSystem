import { useContext, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const normalizeRole = (value) => (value === "doctor" ? "doctor" : "patient");

export default function ForgotPassword() {
  const { forgotPassword } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(normalizeRole(searchParams.get("role")));
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await forgotPassword(role, email);
    setMessage(result.message);

    setIsSubmitting(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen from-indigo-100 to-blue-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Reset password</h1>

        <select
          value={role}
          onChange={(e) => setRole(normalizeRole(e.target.value))}
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

        {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>

        <p className="text-center mt-4 text-gray-500">
          Back to{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
