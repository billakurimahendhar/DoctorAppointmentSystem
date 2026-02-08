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
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only send relevant fields based on role
    const payload =
      role === "doctor"
        ? {
            name: form.name,
            email: form.email,
            password: form.password,
            qualification: form.qualification,
            specialization: form.specialization,
            experience: form.experience,
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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-100 to-blue-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-96"
      >
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Register
        </h1>

        {/* Role Selection */}
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-3 rounded w-full mb-4"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        {/* Common Fields */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="border p-3 rounded w-full mb-4"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border p-3 rounded w-full mb-4"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-3 rounded w-full mb-4"
          value={form.password}
          onChange={handleChange}
          required
        />

        {/* Doctor-Only Fields */}
        {role === "doctor" && (
          <>
            <input
              type="text"
              name="qualification"
              placeholder="Qualification (e.g., MBBS, MD)"
              className="border p-3 rounded w-full mb-4"
              value={form.qualification}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="specialization"
              placeholder="Specialization (e.g., Cardiologist)"
              className="border p-3 rounded w-full mb-4"
              value={form.specialization}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="experience"
              placeholder="Experience (in years)"
              className="border p-3 rounded w-full mb-4"
              value={form.experience}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700"
        >
          Register
        </button>

        <p className="text-center mt-4 text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
