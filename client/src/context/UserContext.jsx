import { createContext, useState } from "react";
import axios from "axios";

export const UserContext = createContext();

export default function UserProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // 🟢 LOGIN (Doctor or Patient)
  const login = async (email, password, role) => {
    const url =
      role === "doctor"
        ? "https://doctorappointmentsystem.onrender.com/api/doctor/login"
        : "https://doctorappointmentsystem.onrender.com/api/patient/login";
    console.log("➡️ Logging in:", { role, email, password });
    
    const { data } = await axios.post(url, { email, password });

    // ✅ Extract ID safely
    const userId = data.user?._id || data._id || data.id;

    // ✅ Prepare user object
    const userData = {
      _id: userId,
      role,
      name: data.user?.name || data.name || "",
      email: data.user?.email || data.email || "",
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setToken(data.token);
  };

  // 🟢 REGISTER
  const register = async (payload, role) => {
    const url =
      role === "doctor"
        ? "https://doctorappointmentsystem.onrender.com/api/doctor/register"
        : "https://doctorappointmentsystem.onrender.com/api/patient/register";
    await axios.post(url, payload);
  };

  // 🟢 LOGOUT
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken("");
  };

  return (
    <UserContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
}
