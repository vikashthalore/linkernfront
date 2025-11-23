// src/lib/api.js
import axios from "axios";
import store from "../store";

// Create API instance
const api = axios.create({
  baseURL: "/api",
  withCredentials: false,
  timeout: 15000
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = store.getState().user?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["Content-Type"] = "application/json";
  return config;
});

// Handle global errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("Token expired or unauthorized.");
      // Optional: auto-logout
      // store.dispatch({ type: "user/logout" });
    }
    return Promise.reject(err);
  }
);

export default api;
