import { createContext, useState, useEffect } from "react";
import api from "../lib/api";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthBasePath = (role) => (role === "doctor" ? "/doctor" : "/patient");

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
        role === "admin"
          ? "/admin/login"
          : role === "doctor"
          ? "/doctor/login"
          : "/patient/login";

      const { data } = await api.post(endpoint, { email, password });
      if (data.success) {
        const userRole = data.role || role;
        const newUser = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: userRole,
          token: data.token,
          profileImage: data.profileImage || "",
          feesPerConsultation: data.feesPerConsultation || 0,
        };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        localStorage.setItem("token", data.token);
        return { success: true, user: newUser };
      }

      return { success: false };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      alert(message);
      return {
        success: false,
        message,
        requiresVerification: Boolean(err.response?.data?.requiresVerification),
      };
    }
  };

  const registerUser = async (role, form) => {
    try {
      const endpoint =
        role === "doctor"
          ? "/doctor/register"
          : "/patient/register";

      const { data } = await api.post(endpoint, form);

      if (data.success) {
        const message =
          data.message || "Registered successfully. Please verify your email, then log in.";
        alert(message);
        return { success: true, message };
      }
      return { success: false };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      alert(message);
      return { success: false, message };
    }
  };

  const forgotPassword = async (role, email) => {
    try {
      const { data } = await api.post(`${getAuthBasePath(role)}/forgot-password`, { email });
      return { success: true, message: data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Could not send reset link",
      };
    }
  };

  const resetPassword = async (role, token, password) => {
    try {
      const { data } = await api.post(`${getAuthBasePath(role)}/reset-password`, {
        token,
        password,
      });
      return { success: true, message: data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Could not reset password",
      };
    }
  };

  const verifyEmail = async (role, token) => {
    try {
      const { data } = await api.get(`${getAuthBasePath(role)}/verify-email`, {
        params: { token },
      });
      return { success: true, message: data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Could not verify email",
      };
    }
  };

  const resendVerificationEmail = async (role, email) => {
    try {
      const { data } = await api.post(`${getAuthBasePath(role)}/resend-verification`, {
        email,
      });
      return { success: true, message: data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Could not resend verification email",
      };
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        token: user?.token || localStorage.getItem("token") || "",
        loginUser,
        registerUser,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerificationEmail,
        logoutUser,
        darkMode,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
