import axios from "axios";

const normalizedBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"
).replace(/\/$/, "");

export const API_BASE_URL = normalizedBaseUrl;

const api = axios.create({
  baseURL: `${normalizedBaseUrl}/api`,
});

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export default api;
