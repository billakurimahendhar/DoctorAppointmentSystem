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
    <div className="form-shell">
      <form onSubmit={handleSubmit} className="form-card">
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-700">Reset password</h1>

        <select
          value={role}
          onChange={(e) => setRole(normalizeRole(e.target.value))}
          className="mb-4 w-full rounded border p-3"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded border p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {message && <p className="mb-4 text-sm text-gray-600">{message}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>

        <p className="mt-4 text-center text-gray-500">
          Back to{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
