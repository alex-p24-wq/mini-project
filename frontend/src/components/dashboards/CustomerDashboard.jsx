import React, { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import "../../css/CustomerDashboard.css";
import "../../css/theme-modern.css";

// Dashboard components
import CustomerOverview from "./customer/CustomerOverview";
import CustomerOrders from "./customer/CustomerOrders";
import CustomerMarketplace from "./customer/CustomerMarketplace";
import CustomerRequestOrder from "./customer/CustomerRequestOrder";
import CustomerWishlist from "./customer/CustomerWishlist";
import CustomerProfile from "./customer/CustomerProfile";
import CustomerFeedback from "./customer/CustomerFeedback";

export default function CustomerDashboard({ user }) {
  const [activePage, setActivePage] = useState("overview");
  
  // Pass the setActivePage function to the DashboardLayout
  const handleMenuItemClick = (itemId) => {
    setActivePage(itemId);
  };

  // Menu items for customer dashboard
  const menuItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "marketplace", label: "Marketplace", icon: "🛒" },
    { id: "request-order", label: "Request Order", icon: "📝" },
    { id: "orders", label: "My Orders", icon: "📦" },
    { id: "wishlist", label: "Wishlist", icon: "❤️" },
    { id: "feedback", label: "Feedback", icon: "💬" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  // Render the active page content
  const renderPageContent = () => {
    switch (activePage) {
      case "overview":
        return <CustomerOverview user={user} />;
      case "marketplace":
        return <CustomerMarketplace user={user} />;
      case "request-order":
        return <CustomerRequestOrder user={user} />;
      case "orders":
        return <CustomerOrders user={user} />;
      case "wishlist":
        return <CustomerWishlist user={user} />;
      case "feedback":
        return <CustomerFeedback />;
      case "profile":
        return <CustomerProfile user={user} />;
      default:
        return <CustomerOverview user={user} />;
    }
  };

  return (
    <DashboardLayout
      user={user}
      menuItems={menuItems}
      pageTitle={`Customer Dashboard - ${activePage.charAt(0).toUpperCase() + activePage.slice(1)}`}
      roleName="Customer"
      onMenuItemClick={handleMenuItemClick}
    >
      <div className="customer-dashboard">
        {renderPageContent()}
      </div>
    </DashboardLayout>
  );
}