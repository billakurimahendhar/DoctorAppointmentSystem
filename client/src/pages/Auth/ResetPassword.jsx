import { useContext, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const normalizeRole = (value) => (value === "doctor" ? "doctor" : "patient");

export default function ResetPassword() {
  const { resetPassword } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const role = normalizeRole(searchParams.get("role"));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(role, token, password);
    setMessage(result.message);
    setIsSubmitting(false);

    if (result.success) {
      setTimeout(() => navigate("/login"), 1200);
    }
  };

  return (
    <div className="form-shell">
      <form onSubmit={handleSubmit} className="form-card">
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-700">Set new password</h1>

        {!token && (
          <p className="mb-4 text-sm text-red-600">
            This reset link is missing its token. Request a new one from the login page.
          </p>
        )}

        <input
          type="password"
          placeholder="New password"
          className="mb-4 w-full rounded border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm new password"
          className="mb-4 w-full rounded border p-3"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {message && <p className="mb-4 text-sm text-gray-600">{message}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
          disabled={isSubmitting || !token}
        >
          {isSubmitting ? "Updating..." : "Update password"}
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
