import { useContext, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const normalizeRole = (value) => (value === "doctor" ? "doctor" : "patient");

export default function VerifyEmail() {
  const { verifyEmail, resendVerificationEmail } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const mode = searchParams.get("mode") || "";
  const [role, setRole] = useState(normalizeRole(searchParams.get("role")));
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [status, setStatus] = useState(token && mode !== "resend" ? "verifying" : "idle");
  const [message, setMessage] = useState(
    token && mode !== "resend" ? "Verifying your email..." : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasAttemptedVerification = useRef(false);

  useEffect(() => {
    if (!token || mode === "resend" || hasAttemptedVerification.current) {
      return;
    }

    hasAttemptedVerification.current = true;
    let isActive = true;

    const runVerification = async () => {
      const result = await verifyEmail(role, token);

      if (!isActive) {
        return;
      }

      setStatus(result.success ? "success" : "error");
      setMessage(result.message);
    };

    runVerification();

    return () => {
      isActive = false;
    };
  }, [mode, role, token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await resendVerificationEmail(role, email);
    setStatus(result.success ? "success" : "error");
    setMessage(result.message);

    setIsSubmitting(false);
  };

  const showResendForm = mode === "resend" || !token || status === "error";

  return (
    <div className="flex justify-center items-center min-h-screen from-indigo-100 to-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Email verification</h1>

        {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

        {showResendForm && (
          <form onSubmit={handleResend}>
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

            <button
              type="submit"
              className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Resend verification email"}
            </button>
          </form>
        )}

        <p className="text-center mt-4 text-gray-500">
          Back to{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
