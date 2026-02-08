import { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useContext(UserContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", specialization: "", qualification: "" });
  const [role, setRole] = useState("patient");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form, role);
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center text-blue-600">Register</h1>
        <select
          className="border w-full p-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
        <input
          placeholder="Name"
          className="border w-full p-2 rounded"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Email"
          type="email"
          className="border w-full p-2 rounded"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          className="border w-full p-2 rounded"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {role === "doctor" && (
          <>
            <input
              placeholder="Qualification"
              className="border w-full p-2 rounded"
              onChange={(e) => setForm({ ...form, qualification: e.target.value })}
            />
            <input
              placeholder="Specialization"
              className="border w-full p-2 rounded"
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            />
          </>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 w-full rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
