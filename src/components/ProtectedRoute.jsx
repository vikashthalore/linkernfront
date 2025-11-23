// src/components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useSelector((state) => state.user);

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin only route protection
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/user" replace />;
  }

  // Normal user should NOT open admin routes
  if (!adminOnly && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
