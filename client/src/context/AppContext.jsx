import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🌙 DARK MODE STATE
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Apply theme to HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  // ✅ Load user safely from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = async (role, email, password) => {
    try {
      const endpoint =
        role === "doctor"
          ? "https://doctorappointmentsystem-0818.onrender.com/api/doctor/login"
          : "https://doctorappointmentsystem-0818.onrender.com/api/patient/login";

      const { data } = await axios.post(endpoint, { email, password });

      if (data.success) {
        const newUser = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role,
          token: data.token,
          profileImage: data.profileImage || "",
        };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
      return { success: false };
    }
  };

  const registerUser = async (role, form) => {
    try {
      const endpoint =
        role === "doctor"
          ? "https://doctorappointmentsystem-0818.onrender.com/api/doctor/register"
          : "https://doctorappointmentsystem-0818.onrender.com/api/patient/register";

      const { data } = await axios.post(endpoint, form);

      if (data.success) {
        alert("Registered successfully! Please login.");
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
      return { success: false };
    }
  };

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
        darkMode,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
