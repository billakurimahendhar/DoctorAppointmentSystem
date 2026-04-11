import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

export default function Register() {
  const { registerUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    qualification: "",
    specialization: "",
    experience: "",
    feesPerConsultation: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload =
      role === "doctor"
        ? {
            name: form.name,
            email: form.email,
            password: form.password,
            qualification: form.qualification,
            specialization: form.specialization,
            experience: form.experience,
            feesPerConsultation: Number(form.feesPerConsultation || 0),
          }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
          };

    const result = await registerUser(role, payload);
    if (result.success) {
      navigate("/login");
    }
  };

  return (
    <div className="form-shell">
      <form onSubmit={handleSubmit} className="form-card">
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-700">
          Register
        </h1>

        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mb-4 w-full rounded border p-3"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="mb-4 w-full rounded border p-3"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="mb-4 w-full rounded border p-3"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="mb-4 w-full rounded border p-3"
          value={form.password}
          onChange={handleChange}
          required
        />

        {role === "doctor" && (
          <>
            <input
              type="text"
              name="qualification"
              placeholder="Qualification (e.g., MBBS, MD)"
              className="mb-4 w-full rounded border p-3"
              value={form.qualification}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="specialization"
              placeholder="Specialization (e.g., Cardiologist)"
              className="mb-4 w-full rounded border p-3"
              value={form.specialization}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="experience"
              placeholder="Experience (in years)"
              className="mb-4 w-full rounded border p-3"
              value={form.experience}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="feesPerConsultation"
              placeholder="Consultation Fee"
              className="mb-4 w-full rounded border p-3"
              value={form.feesPerConsultation}
              onChange={handleChange}
              min="0"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Register
        </button>

        <p className="mt-4 text-center text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
