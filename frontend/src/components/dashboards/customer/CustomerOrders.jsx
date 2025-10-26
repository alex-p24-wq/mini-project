import React, { useEffect, useMemo, useState } from "react";
import "../../../css/CustomerDashboard.css";
import { getCustomerOrders, cancelCustomerOrder } from "../../../services/api";

export default function CustomerOrders({ user }) {
  const [activeTab, setActiveTab] = useState("All");
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({ All: 0, Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isCancelling, setIsCancelling] = useState("");

  const tabs = [
    { id: "All", label: "All Orders" },
    { id: "Processing", label: "Processing" },
    { id: "Shipped", label: "Shipped" },
    { id: "Delivered", label: "Delivered" },
    { id: "Cancelled", label: "Cancelled" },
  ];

  const fetchOrders = async (status) => {
    try {
      setLoading(true);
      setError("");
      const res = await getCustomerOrders({ status: status === "All" ? undefined : status, page: 1, limit: 50 });
      setOrders(res.items || []);
      setCounts(res.counts || counts);
    } catch (e) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const onCancelOrder = async (orderId) => {
    try {
      setIsCancelling(orderId);
      await cancelCustomerOrder(orderId);
      await fetchOrders(activeTab);
    } catch (e) {
      alert(e?.message || "Failed to cancel order");
    } finally {
      setIsCancelling("");
    }
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === "All") return orders;
    return (orders || []).filter(o => o.status === activeTab);
  }, [orders, activeTab]);

  const formatCurrency = (amount, currency = "INR") => {
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount || 0);
    } catch {
      return `₹${amount || 0}`;
    }
  };

  const humanDate = (d) => new Date(d).toLocaleDateString();

  return (
    <div className="customer-orders">
      <div className="orders-hero">
        <div>
          <div className="hero-badge">📦 My Orders</div>
          <h2>Track and manage your purchases</h2>
          <p>View details, track shipping, and manage your orders.</p>
        </div>
        <div className="orders-stats">
          <div className="orders-stat">
            <span className="stat-label">Total</span>
            <span className="stat-value">{counts.All}</span>
          </div>
          <div className="orders-stat">
            <span className="stat-label">Processing</span>
            <span className="stat-value">{counts.Processing}</span>
          </div>
          <div className="orders-stat">
            <span className="stat-label">Shipped</span>
            <span className="stat-value">{counts.Shipped}</span>
          </div>
          <div className="orders-stat">
            <span className="stat-label">Delivered</span>
            <span className="stat-value">{counts.Delivered}</span>
          </div>
        </div>
      </div>

      <div className="order-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            <span className="tab-count">{counts[t.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="orders-list">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div className="order-card fancy skeleton" key={`sk-${i}`}>
              <div className="skeleton-text" style={{ height: 18, width: '40%', marginTop: 16, marginLeft: 16 }} />
              <div className="skeleton-text" style={{ height: 12, width: '30%', marginTop: 8, marginLeft: 16, marginBottom: 16 }} />
              <div className="skeleton-image" style={{ height: 80, margin: '0 16px 16px 16px', borderRadius: 12 }} />
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧺</div>
            <h3>No orders found</h3>
            <p>You don't have any {activeTab !== 'All' ? activeTab.toLowerCase() : ''} orders yet.</p>
            {activeTab !== 'All' && (
              <button className="view-all-btn" onClick={() => setActiveTab('All')}>
                View All Orders
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => {
            const orderId = order._id || order.id;
            const total = order.amount ?? order.total;
            const currency = order.currency || 'INR';
            return (
              <div className="order-card fancy" key={orderId}>
                <div className="order-header" onClick={() => setExpandedOrder(expandedOrder === orderId ? null : orderId)}>
                  <div className="order-info">
                    <h3>Order #{String(orderId).slice(-6).toUpperCase()}</h3>
                    <p>Placed on {humanDate(order.createdAt)}</p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${String(order.status || '').toLowerCase()}`}>
                      {order.status}
                    </span>
                    <span className="order-total">{formatCurrency(total, currency)}</span>
                    <span className="expand-icon">{expandedOrder === orderId ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expandedOrder === orderId && (
                  <div className="order-details">
                    <h4>Items</h4>
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Grade</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.items || []).map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="order-item">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="order-item-thumb" />
                                ) : (
                                  <div className="order-item-thumb placeholder">🌿</div>
                                )}
                                <div>
                                  <div className="item-name">{item.name}</div>
                                  {item.product && <div className="item-sub">#{String(item.product).slice(-6).toUpperCase()}</div>}
                                </div>
                              </div>
                            </td>
                            <td>{item.grade || '-'}</td>
                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.price, currency)}</td>
                            <td>{formatCurrency(item.quantity * item.price, currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="4" className="text-right">Order Total:</td>
                          <td>{formatCurrency(total, currency)}</td>
                        </tr>
                      </tfoot>
                    </table>

                    <div className="order-actions">
                      <button className="track-btn">Track Order</button>
                      {order.status === "Delivered" && (
                        <button className="review-btn">Write Review</button>
                      )}
                      {["Pending", "Processing"].includes(order.status) && (
                        <button
                          className="cancel-btn"
                          disabled={isCancelling === orderId}
                          onClick={() => onCancelOrder(orderId)}
                        >
                          {isCancelling === orderId ? "Cancelling..." : "Cancel Order"}
                        </button>
                      )}
                      <button className="support-btn">Contact Support</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}