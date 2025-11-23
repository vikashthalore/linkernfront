// src/contexts/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // user data
  const [loading, setLoading] = useState(true); // loading user

  // Load user from backend using stored token
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me"); // backend route
      setUser(res.data.user);
    } catch (err) {
      console.error("Auth Error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Load user on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  // logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loadingUser: loading,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
