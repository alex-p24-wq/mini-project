import React, { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import "../../css/HubDashboard.css";
import "../../css/theme-modern.css";
import HubOverview from "./hub/HubOverview";
import HubList from "./hubmanager/HubList";
import HubBulkProducts from "./hubmanager/HubBulkProducts";
import FeedbackForm from "./shared/FeedbackForm";

export default function HubDashboard({ user }) {
  const [activePage, setActivePage] = useState("overview");

  // Menu items for hub dashboard
  const menuItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "bulkproducts", label: "Bulk Products", icon: "📦" },
    { id: "hublist", label: "Hub Network", icon: "🏢" },
    { id: "farmers", label: "Farmers", icon: "👨‍🌾" },
    { id: "customers", label: "Customers", icon: "👥" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "feedback", label: "Feedback", icon: "💬" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  const renderPageContent = () => {
    switch (activePage) {
      case "overview":
        return <HubOverview user={user} />;
      case "bulkproducts":
        return <HubBulkProducts user={user} />;
      case "hublist":
        return <HubList user={user} />;
      case "farmers":
        return (
          <div className="hub-dashboard">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Farmer Management</h3>
              </div>
              <div className="card-content">
                <p>Farmer relationship management features will be implemented here.</p>
              </div>
            </div>
          </div>
        );
      case "customers":
        return (
          <div className="hub-dashboard">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Customer Management</h3>
              </div>
              <div className="card-content">
                <p>Customer relationship management features will be implemented here.</p>
              </div>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="hub-dashboard">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Analytics & Reports</h3>
              </div>
              <div className="card-content">
                <p>Analytics and reporting features will be implemented here.</p>
              </div>
            </div>
          </div>
        );
      case "feedback":
        return <FeedbackForm title="Hub Feedback" />;
      case "profile":
        return (
          <div className="hub-dashboard">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Profile</h3>
              </div>
              <div className="card-content">
                <p><b>Username:</b> {user.username}</p>
                <p><b>Email:</b> {user.email}</p>
                <p><b>Role:</b> {user.role}</p>
              </div>
            </div>
          </div>
        );
      default:
        return <HubOverview user={user} />;
    }
  };

  return (
    <DashboardLayout
      user={user}
      menuItems={menuItems}
      pageTitle={`Hub Manager Dashboard - ${activePage.charAt(0).toUpperCase() + activePage.slice(1)}`}
      roleName="Hub Manager"
      onMenuItemClick={setActivePage}
    >
      {renderPageContent()}
    </DashboardLayout>
  );
}