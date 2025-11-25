// src/utils/api.js
import axios from "axios";

// Create instance
const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

// TOKEN ADDER — store ko lazily load karo (NO top-level import)
api.interceptors.request.use((config) => {
  const store = require("../store").default;   // ← FIX: dynamic import
  const token = store.getState()?.user?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const impersonateId = localStorage.getItem("impersonateUserId");
  if (impersonateId) {
    config.headers["X-Impersonate-User"] = impersonateId;
  }

  return config;
});

export default api;


// //////////////////////

// // src/lib/api.js
// import axios from "axios";
// import store from "../store"; // redux store import karo

// // BASE URL → just '/api' (Vite proxy handle karega)
// const api = axios.create({
//   baseURL: "/api",
//   withCredentials: true
// });

// // AUTO-ATTACH TOKEN before every request
// api.interceptors.request.use((config) => {
//   const state = store.getState();
//   const token = state.user?.token;

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   // YE LINE ADD KAR DE — AGAR IMPERSONATE KAR RAHA HAI TO USER ID BHEJ DO
//   const impersonateId = localStorage.getItem("impersonateUserId");
//   if (impersonateId) {
//     config.headers["X-Impersonate-User"] = impersonateId;
//   }
  
//   return config;
// });

// export default api;
