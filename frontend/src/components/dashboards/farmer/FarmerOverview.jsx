import React, { useEffect, useMemo, useState } from "react";
import "../../../css/CardamomComponents.css";
import { getFarmerStats, getFarmerProducts, getFarmerOrders } from "../../../services/api";

export default function FarmerOverview({ user }) {
  // Local, persisted profile and related counts
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("farmerProfile");
      if (saved) {
        const savedProfile = JSON.parse(saved);
        // Only use saved profile if it belongs to the current user
        if (savedProfile.userId === user?.id) {
          return savedProfile;
        } else {
          // Clear outdated profile data
          localStorage.removeItem("farmerProfile");
        }
      }
    } catch {}
    return { fullName: user?.profile?.fullName || "", email: user?.email || "", userId: user?.id };
  });

  const [stats, setStats] = useState({ 
    totalInventory: 0, 
    totalProducts: 0, 
    pendingOrders: 0, 
    monthlyRevenue: 0, 
    averageRating: 0 
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Load dynamic data for stats + recent orders
  useEffect(() => {
    const loadOverview = async () => {
      try {
        // Load farmer stats
        setLoadingStats(true);
        const statsRes = await getFarmerStats();
        setStats({
          totalInventory: statsRes.totalInventory || 0,
          totalProducts: statsRes.totalProducts || 0,
          pendingOrders: statsRes.pendingOrders || 0,
          monthlyRevenue: statsRes.monthlyRevenue || 0,
          averageRating: statsRes.averageRating || 0
        });
        setRecentProducts(statsRes.products || []);
      } catch (error) {
        console.error('Failed to load farmer stats:', error);
        setStats({ totalInventory: 0, totalProducts: 0, pendingOrders: 0, monthlyRevenue: 0, averageRating: 0 });
      } finally {
        setLoadingStats(false);
      }

      try {
        // Load recent orders
        setLoadingOrders(true);
        const ordersRes = await getFarmerOrders({ page: 1, limit: 5 });
        setRecentOrders(Array.isArray(ordersRes?.items) ? ordersRes.items.slice(0, 5) : []);
      } catch (error) {
        console.error('Failed to load farmer orders:', error);
        setRecentOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    // Keep profile fresh from localStorage if it changes elsewhere, but only for current user
    try {
      const saved = localStorage.getItem("farmerProfile");
      if (saved) {
        const savedProfile = JSON.parse(saved);
        // Only use saved profile if it belongs to the current user
        if (savedProfile.userId === user?.id) {
          setProfile(savedProfile);
        } else {
          // Clear outdated profile data and reset to current user
          localStorage.removeItem("farmerProfile");
          setProfile({ fullName: user?.profile?.fullName || "", email: user?.email || "", userId: user?.id });
        }
      }
    } catch {}

    loadOverview();
  }, [user?.id]);

  const displayName = profile?.fullName?.trim() || user?.username || "Farmer";

  const statCards = useMemo(() => [
    { label: "Current Inventory", value: `${stats.totalInventory} kg`, icon: "📦", color: "#4CAF50" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: "🛒", color: "#2196F3" },
    { label: "Monthly Revenue", value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: "💰", color: "#FF9800" },
    { label: "Average Rating", value: `${stats.averageRating}/5`, icon: "⭐", color: "#9C27B0" },
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
          <p>Manage your farm inventory and engage customers.</p>
        </div>
        <div className="welcome-image">
          <img src="/images/plant12.jpeg" alt="Welcome" />
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
              <h3>Recent Orders</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="card-content">
              {loadingOrders ? (
                <div className="empty-state">
                  <div className="empty-icon">⏳</div>
                  <h3>Loading your recent orders...</h3>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🧺</div>
                  <h3>No recent orders</h3>
                  <p>Orders for your products will appear here.</p>
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
                    {recentOrders.map((order) => {
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
              <h3>Your Products</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="card-content">
              {loadingStats ? (
                <div className="empty-state">
                  <div className="empty-icon">⏳</div>
                  <h3>Loading your products...</h3>
                </div>
              ) : recentProducts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🌱</div>
                  <h3>No products yet</h3>
                  <p>Add your first product to start selling.</p>
                </div>
              ) : (
                <div className="product-grid">
                  {recentProducts.map((product) => (
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
                        <button className="add-to-cart-btn">📝 Edit Product</button>
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
