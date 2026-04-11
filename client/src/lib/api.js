import axios from "axios";

const defaultBaseUrl = import.meta.env.DEV
  ? "http://localhost:4000"
  : "https://doctorappointmentsystem-0818.onrender.com";

const configuredBaseUrl = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE_URL_DEV || defaultBaseUrl
  : import.meta.env.VITE_API_BASE_URL || defaultBaseUrl;

const normalizedBaseUrl = configuredBaseUrl.replace(/\/$/, "");

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
