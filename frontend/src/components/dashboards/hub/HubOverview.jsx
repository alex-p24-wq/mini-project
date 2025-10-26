import React, { useEffect, useMemo, useState } from "react";
import "../../../css/CardamomComponents.css";
import { getHubStats, getHubShipments, getHubInventory } from "../../../services/api";

export default function HubOverview({ user }) {
  // Local, persisted profile and related counts
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("hubProfile");
      if (saved) {
        const savedProfile = JSON.parse(saved);
        // Only use saved profile if it belongs to the current user
        if (savedProfile.userId === user?.id) {
          return savedProfile;
        } else {
          // Clear outdated profile data
          localStorage.removeItem("hubProfile");
        }
      }
    } catch {}
    return { fullName: user?.profile?.fullName || "", email: user?.email || "", userId: user?.id };
  });

  const [stats, setStats] = useState({ 
    totalInventory: 0, 
    pendingShipments: 0, 
    registeredFarmers: 0, 
    activeCustomers: 0 
  });
  const [recentShipments, setRecentShipments] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingShipments, setLoadingShipments] = useState(true);

  // Load dynamic data for stats + recent shipments
  useEffect(() => {
    const loadOverview = async () => {
      try {
        // Load hub stats
        setLoadingStats(true);
        const statsRes = await getHubStats();
        setStats({
          totalInventory: statsRes.totalInventory || 0,
          pendingShipments: statsRes.pendingShipments || 0,
          registeredFarmers: statsRes.registeredFarmers || 0,
          activeCustomers: statsRes.activeCustomers || 0
        });
      } catch (error) {
        console.error('Failed to load hub stats:', error);
        setStats({ totalInventory: 0, pendingShipments: 0, registeredFarmers: 0, activeCustomers: 0 });
      } finally {
        setLoadingStats(false);
      }

      try {
        // Load recent shipments
        setLoadingShipments(true);
        const shipmentsRes = await getHubShipments({ page: 1, limit: 5 });
        setRecentShipments(Array.isArray(shipmentsRes?.items) ? shipmentsRes.items.slice(0, 5) : []);
      } catch (error) {
        console.error('Failed to load hub shipments:', error);
        setRecentShipments([]);
      } finally {
        setLoadingShipments(false);
      }

      try {
        // Load inventory items
        const inventoryRes = await getHubInventory({ page: 1, limit: 4 });
        setInventoryItems(Array.isArray(inventoryRes?.items) ? inventoryRes.items.slice(0, 4) : []);
      } catch (error) {
        console.error('Failed to load hub inventory:', error);
        setInventoryItems([]);
      }
    };

    // Keep profile fresh from localStorage if it changes elsewhere, but only for current user
    try {
      const saved = localStorage.getItem("hubProfile");
      if (saved) {
        const savedProfile = JSON.parse(saved);
        // Only use saved profile if it belongs to the current user
        if (savedProfile.userId === user?.id) {
          setProfile(savedProfile);
        } else {
          // Clear outdated profile data and reset to current user
          localStorage.removeItem("hubProfile");
          setProfile({ fullName: user?.profile?.fullName || "", email: user?.email || "", userId: user?.id });
        }
      }
    } catch {}

    loadOverview();
  }, [user?.id]);

  const displayName = profile?.fullName?.trim() || user?.username || "Hub Manager";

  const statCards = useMemo(() => [
    { label: "Current Inventory", value: `${stats.totalInventory} kg`, icon: "📦", color: "#4CAF50" },
    { label: "Pending Shipments", value: stats.pendingShipments, icon: "🚚", color: "#2196F3" },
    { label: "Registered Farmers", value: stats.registeredFarmers, icon: "👨‍🌾", color: "#FF9800" },
    { label: "Active Customers", value: stats.activeCustomers, icon: "👥", color: "#9C27B0" },
  ], [stats]);

  const formatCurrency = (amount, currency = "INR") => {
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount || 0);
    } catch {
      return `₹${amount || 0}`;
    }
  };

  const humanDate = (d) => {
    try { return new Date(d).toLocaleDateString(); } catch { return "-"; }
  };

  return (
    <div className="customer-overview">
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>Welcome back, {displayName}!</h2>
          <p>Manage your hub operations and logistics.</p>
        </div>
        <div className="welcome-image">
          <img src="/images/plant14.jpeg" alt="Welcome" />
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-details">
              <h3>{loadingStats ? "..." : stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-row">
        <div className="dashboard-col">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Shipments</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="card-content">
              {loadingShipments ? (
                <div className="empty-state">
                  <div className="empty-icon">⏳</div>
                  <h3>Loading recent shipments...</h3>
                </div>
              ) : recentShipments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🚚</div>
                  <h3>No recent shipments</h3>
                  <p>Shipments will appear here as orders are processed.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentShipments.map((order) => {
                      const orderId = order._id || order.id;
                      const total = order.amount ?? order.total;
                      const currency = order.currency || "INR";
                      const customerName = order.customer?.username || "Unknown";
                      return (
                        <tr key={orderId}>
                          <td>{String(orderId).slice(-6).toUpperCase()}</td>
                          <td>{customerName}</td>
                          <td>{humanDate(order.createdAt || order.date)}</td>
                          <td>
                            <span className={`status-badge ${String(order.status || '').toLowerCase()}`}>
                              {order.status || "-"}
                            </span>
                          </td>
                          <td>{formatCurrency(total, currency)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        
        <div className="dashboard-col">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Inventory Status</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="card-content">
              {inventoryItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>No inventory items</h3>
                  <p>Inventory items will appear here.</p>
                </div>
              ) : (
                <div className="product-grid">
                  {inventoryItems.map((product) => (
                    <div className="product-card" key={product._id || product.id}>
                      <div className="product-image">
                        <img src={product.image || "/images/plant11.jpeg"} alt={product.name} />
                      </div>
                      <div className="product-details">
                        <h4>{product.name}</h4>
                        <p className="product-price">₹{product.price}/kg</p>
                        <p style={{ fontSize: '12px', color: '#5d4037', margin: '4px 0 8px', lineHeight: '1.3' }}>
                          Stock: {product.stock} kg • {product.grade}
                        </p>
                        <p style={{ fontSize: '11px', color: '#666', margin: '0' }}>
                          By: {product.user?.username || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
