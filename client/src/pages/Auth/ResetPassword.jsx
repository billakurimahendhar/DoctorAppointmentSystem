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
    <div className="flex justify-center items-center min-h-screen from-indigo-100 to-blue-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Set new password</h1>

        {!token && (
          <p className="text-sm text-red-600 mb-4">
            This reset link is missing its token. Request a new one from the login page.
          </p>
        )}

        <input
          type="password"
          placeholder="New password"
          className="border p-3 rounded w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm new password"
          className="border p-3 rounded w-full mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 disabled:opacity-70"
          disabled={isSubmitting || !token}
        >
          {isSubmitting ? "Updating..." : "Update password"}
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
