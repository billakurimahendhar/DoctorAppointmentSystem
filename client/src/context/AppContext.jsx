import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user safely from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ✅ Login function (same as your old one)
  const loginUser = async (role, email, password) => {
    try {
      const endpoint =
        role === "doctor"
          ? "http://localhost:4000/api/doctor/login"
          : "http://localhost:4000/api/patient/login";

      const { data } = await axios.post(endpoint, { email, password });

      if (data.success) {
        const newUser = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role,
          token: data.token,
        };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || "Login failed");
      return { success: false };
    }
  };

  // ✅ Register function (same as your old one)
  const registerUser = async (role, form) => {
    try {
      const endpoint =
        role === "doctor"
          ? "http://localhost:4000/api/doctor/register"
          : "http://localhost:4000/api/patient/register";

      const { data } = await axios.post(endpoint, form);

      if (data.success) {
        alert("Registered successfully! Please login.");
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error("Register Error:", err);
      alert(err.response?.data?.message || "Registration failed");
      return { success: false };
    }
  };

  // ✅ Logout function
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        loginUser,
        registerUser,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
