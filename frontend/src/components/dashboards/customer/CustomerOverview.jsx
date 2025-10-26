import React, { useEffect, useMemo, useState } from "react";
import "../../../css/CardamomComponents.css";
import { getCustomerOrders, getWishlist } from "../../../services/api";
import { useNotifications } from "../../../contexts/NotificationContext";
import { createSuccessNotification } from "../../../utils/notifications";
import { useToast } from "../../notifications/ToastContainer";

export default function CustomerOverview({ user }) {
  const { addNotification } = useNotifications();
  const { showSuccess, showError } = useToast();
  
  // Local, persisted profile and related counts
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("customerProfile");
      if (saved) {
        const savedProfile = JSON.parse(saved);
        // Only use saved profile if it belongs to the current user
        if (savedProfile.userId === user?.id) {
          return savedProfile;
        } else {
          // Clear outdated profile data
          localStorage.removeItem("customerProfile");
        }
      }
    } catch {}
    return { fullName: user?.profile?.fullName || "", email: user?.email || "", userId: user?.id };
  });

  const [counts, setCounts] = useState({ orders: 0, wishlist: 0, cart: 0, addresses: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Load dynamic data for stats + recent orders
  useEffect(() => {
    const loadOverview = async () => {
      // Addresses from localStorage
      let addresses = 0;
      try {
        const a = JSON.parse(localStorage.getItem("customerAddresses") || "[]");
        addresses = Array.isArray(a) ? a.length : 0;
      } catch {}

      // Cart from localStorage (support a few common shapes)
      let cart = 0;
      try {
        const raw =
          localStorage.getItem("customerCart") ||
          localStorage.getItem("cart") ||
          localStorage.getItem("cartItems");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) cart = parsed.length;
          else if (Array.isArray(parsed?.items)) cart = parsed.items.length;
          else if (typeof parsed === "number") cart = parsed;
        }
      } catch {}

      // Wishlist via API (ignore errors if unauthenticated)
      let wishlist = 0;
      try {
        const w = await getWishlist();
        wishlist = Array.isArray(w?.items) ? w.items.length : 0;
      } catch {
        wishlist = 0;
      }

      // Orders via API
      setLoadingOrders(true);
      try {
        const res = await getCustomerOrders({ page: 1, limit: 5 });
        const totalOrders = typeof res?.counts?.All === "number" ? res.counts.All : (Array.isArray(res?.items) ? res.items.length : 0);
        setRecentOrders(Array.isArray(res?.items) ? res.items.slice(0, 5) : []);
        setCounts({ orders: totalOrders, wishlist, cart, addresses });
      } catch {
        setRecentOrders([]);
        setCounts({ orders: 0, wishlist, cart, addresses });
      } finally {
        setLoadingOrders(false);
      }
    };

    // Keep profile fresh from localStorage if it changes elsewhere, but only for current user
    try {
      const saved = localStorage.getItem("customerProfile");
      if (saved) {
        const savedProfile = JSON.parse(saved);
        // Only use saved profile if it belongs to the current user
        if (savedProfile.userId === user?.id) {
          setProfile(savedProfile);
        } else {
          // Clear outdated profile data and reset to current user
          localStorage.removeItem("customerProfile");
          setProfile({ fullName: user?.profile?.fullName || "", email: user?.email || "", userId: user?.id });
        }
      }
    } catch {}

    loadOverview();
  }, [user?.id]);

  const displayName = profile?.fullName?.trim() || user?.username || "User";

  const stats = useMemo(() => [
    { label: "Total Orders", value: counts.orders, icon: "📦", color: "#4CAF50" },
    { label: "Wishlist Items", value: counts.wishlist, icon: "❤️", color: "#F44336" },
    { label: "Cart Items", value: counts.cart, icon: "🛒", color: "#2196F3" },
    { label: "Saved Addresses", value: counts.addresses, icon: "📍", color: "#FF9800" },
  ], [counts]);

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

  const handleAddToCart = (product) => {
    try {
      // Get existing cart or create new one
      const existingCart = JSON.parse(localStorage.getItem("customerCart") || "[]");
      
      // Check if product already exists in cart
      const existingItemIndex = existingCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Increase quantity if product exists
        existingCart[existingItemIndex].quantity += 1;
      } else {
        // Add new product to cart
        existingCart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          grade: product.grade,
          quantity: 1
        });
      }
      
      // Save updated cart
      localStorage.setItem("customerCart", JSON.stringify(existingCart));
      
      // Add notification to bell icon
      addNotification(createSuccessNotification(
        'Added to Cart',
        `${product.name} has been added to your cart successfully.`,
        { icon: '🛒', autoRemove: true }
      ));
      
      // Show beautiful toast notification
      showSuccess(
        "Added to Cart!",
        `${product.name} has been added to your cart successfully.`,
        { 
          icon: "🛒",
          duration: 3000
        }
      );
    } catch (error) {
      console.error('Failed to add to cart:', error);
      
      // Show error toast
      showError(
        "Failed to Add to Cart",
        "Failed to add product to cart. Please try again.",
        { 
          icon: "❌",
          duration: 4000
        }
      );
    }
  };

  const [featuredProducts, setFeaturedProducts] = useState([
    { id: "CARD-001", name: "Premium Green Cardamom", price: 450, image: "/images/plant11.jpeg", description: "Fresh harvest from Kerala hills", grade: "Premium" },
    { id: "CARD-002", name: "Organic Cardamom Pods", price: 550, image: "/images/plant12.jpeg", description: "Certified organic, pesticide-free", grade: "Organic" },
    { id: "CARD-003", name: "Special Grade Cardamom", price: 650, image: "/images/plant13.jpeg", description: "Export quality, hand-picked", grade: "Premium" },
  ]);

  return (
    <div className="customer-overview">
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>Welcome back, {displayName}!</h2>
          <p>Here's what's happening with your account today.</p>
        </div>
        <div className="welcome-image">
          <img src="/images/plant11.jpeg" alt="Welcome" />
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-details">
              <h3>{stat.value}</h3>
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
                  <p>Start shopping in the Marketplace to see them here.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
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
                      return (
                        <tr key={orderId}>
                          <td>{String(orderId).slice(-6).toUpperCase()}</td>
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
              <h3>Featured Products</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="view-all-btn"
                  onClick={() => {
                    // Add to bell icon
                    addNotification(createSuccessNotification(
                      'Test Notification',
                      'This is a test notification to demonstrate the bell icon functionality!',
                      { icon: '🔔', autoRemove: false }
                    ));
                    // Show beautiful toast
                    showSuccess(
                      "Test Notification!",
                      "This is a beautiful toast notification! Check the bell icon too.",
                      { 
                        icon: "🎉",
                        duration: 5000
                      }
                    );
                  }}
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                >
                  Test Notifications 🔔
                </button>
                <button className="view-all-btn">View All</button>
              </div>
            </div>
            <div className="card-content">
              <div className="product-grid">
                {featuredProducts.map((product) => (
                  <div className="product-card" key={product.id}>
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="product-details">
                      <h4>{product.name}</h4>
                      <p className="product-price">₹{product.price}/kg</p>
                      <p style={{ fontSize: '12px', color: '#5d4037', margin: '4px 0 8px', lineHeight: '1.3' }}>
                        {product.description}
                      </p>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}