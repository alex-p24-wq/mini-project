import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../services/auth";

// Wrap protected pages to ensure only authenticated users can access them
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}