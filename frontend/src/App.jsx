import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { ConfirmationProvider } from "./contexts/ConfirmationContext.jsx";
import { ToastProvider } from "./components/notifications/ToastContainer.jsx";
import "./App.css";
import HubDistrictPage from "./pages/HubDistrictPage.jsx";

export default function App() {
  return (
    <NotificationProvider>
      <ConfirmationProvider>
        <ToastProvider>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:productId"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hubs/district/:district"
            element={
              <ProtectedRoute>
                <HubDistrictPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </ConfirmationProvider>
    </NotificationProvider>
  );
}

