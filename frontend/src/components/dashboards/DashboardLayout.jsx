import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/auth";
import { useNavigationBlock } from "../../hooks/useNavigationBlock";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import NotificationDropdown from "../notifications/NotificationDropdown";
import "../../css/CardamomDashboard.css";

export default function DashboardLayout({ 
  user, 
  children, 
  menuItems, 
  pageTitle, 
  roleName,
  onMenuItemClick 
}) {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(menuItems[0]?.id || "overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showConfirmation } = useConfirmation();

  // Enable navigation blocking for dashboard pages
  useNavigationBlock(true);

  const handleLogout = async () => {
    const confirmed = await showConfirmation({
      title: "Logout Confirmation",
      message: "Are you sure you want to logout? You will be redirected to the login page.",
      confirmText: "Yes, Logout",
      cancelText: "Cancel",
      type: "info",
      icon: "👋"
    });

    if (confirmed) {
      await logout(); // clear local state (and firebase if present)
      navigate("/login", { replace: true });
    }
  };

  // Listen for force logout events from navigation blocking
  useEffect(() => {
    const handleForceLogout = async () => {
      // Direct logout without confirmation (already confirmed in navigation block)
      await logout();
      navigate("/login", { replace: true });
    };

    window.addEventListener('forceLogout', handleForceLogout);
    
    return () => {
      window.removeEventListener('forceLogout', handleForceLogout);
    };
  }, [navigate]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img src="/images/cardooo1.jpg" alt="Cardo Logo" />
            <span>Cardo</span>
          </div>
          <button className="close-menu-btn" onClick={toggleMobileMenu}>×</button>
        </div>
        
        <div className="user-info">
          <div className="avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="username">{user.username}</div>
            <div className="role">{roleName}</div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage(item.id);
                    if (onMenuItemClick) onMenuItemClick(item.id);
                  }}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="icon">🚪</span>
            <span className="label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            ☰
          </button>
          <h1>{pageTitle}</h1>
          <div className="header-actions">
            <NotificationDropdown />
            <button className="profile-btn" onClick={() => setActivePage("profile")}>
              <div className="avatar-small">{user.username.charAt(0).toUpperCase()}</div>
            </button>
          </div>
        </header>
        
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}