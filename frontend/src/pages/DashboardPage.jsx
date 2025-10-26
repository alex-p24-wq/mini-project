import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/DashboardPage.css";

// Role-specific dashboard components
import CustomerDashboard from "../components/dashboards/CustomerDashboard";
import FarmerDashboard from "../components/dashboards/FarmerDashboard";
import AgriCareDashboard from "../components/dashboards/AgriCareDashboard";
import HubDashboard from "../components/dashboards/HubDashboard";
import AdminDashboard from "../components/dashboards/AdminDashboard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read user only; route auth is enforced by ProtectedRoute
    const userStr = localStorage.getItem("user");
    try {
      const userData = userStr ? JSON.parse(userStr) : null;
      setUser(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Render the appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case "customer":
        return <CustomerDashboard user={user} />;
      case "farmer":
        return <FarmerDashboard user={user} />;
      case "agricare":
        return <AgriCareDashboard user={user} />;
      case "hub":
        return <HubDashboard user={user} />;
      case "admin":
        return <AdminDashboard user={user} />;
      default:
        return (
          <div className="dashboard-error">
            <h2>Invalid User Role</h2>
            <p>Your account has an invalid role. Please contact support.</p>
            <button 
              onClick={() => {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                navigate("/login", { replace: true });
              }}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      {renderDashboard()}
    </div>
  );
}