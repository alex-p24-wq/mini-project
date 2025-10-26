import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import "../../css/AgriCareDashboard.css";
import "../../css/theme-modern.css";
import FeedbackForm from "./shared/FeedbackForm";
import { getAgricareStats, getAgricareProducts, getAgricareOrders, getAgricareFarmers, createAgricareProduct } from "../../services/api";

export default function AgriCareDashboard({ user }) {
  // Sidebar menu for AgriCare
  const menuItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "products", label: "Products", icon: "🧪" },
    { id: "orders", label: "Orders", icon: "🛒" },
    { id: "farmers", label: "Farmers", icon: "👨‍🌾" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "feedback", label: "Feedback", icon: "💬" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  // Track active section (synced with DashboardLayout via onMenuItemClick)
  const [active, setActive] = useState("overview");

  // Live data from API
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [stats, setStats] = useState({ products: 0, orders: 0, farmers: 0, revenue: 0 });
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const emptyForm = { name: "", type: "Fertilizer", price: "", stock: "", image: "", description: "" };
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [preview, setPreview] = useState("");

  // Simple profile (persisted locally for demo)
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("agricareProfile");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { fullName: user?.profile?.fullName || user?.username || "", email: user?.email || "", phone: "" };
  });

  useEffect(() => {
    try { localStorage.setItem("agricareProfile", JSON.stringify(profile)); } catch {}
  }, [profile]);

  // Load data when component mounts or active section changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load stats
        const statsRes = await getAgricareStats();
        setStats(statsRes);

        // Load products
        const productsRes = await getAgricareProducts({ page: 1, limit: 10 });
        setProducts(productsRes.items || []);

        // Load orders
        const ordersRes = await getAgricareOrders({ page: 1, limit: 10 });
        setOrders(ordersRes.items || []);

        // Load farmers
        const farmersRes = await getAgricareFarmers({ page: 1, limit: 10 });
        setFarmers(farmersRes.items || []);
      } catch (error) {
        console.error('Failed to load AgriCare data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    try { setPreview(f ? URL.createObjectURL(f) : ""); } catch {}
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setFormError("");
    setPreview("");
  };

  const onAddProduct = async (e) => {
    e.preventDefault();
    setFormError("");
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!form.name.trim()) return setFormError("Product name is required");
    if (isNaN(price) || price <= 0) return setFormError("Price must be greater than ₹0");
    if (!Number.isInteger(stock) || stock < 1) return setFormError("Stock must be at least 1");

    setAdding(true);
    try {
      let payload;
      if (file) {
        const fd = new FormData();
        fd.append('name', form.name.trim());
        if (form.type) fd.append('type', form.type.trim());
        fd.append('price', String(price));
        fd.append('stock', String(stock));
        if (form.description) fd.append('description', form.description.trim());
        fd.append('image', file);
        payload = fd;
      } else {
        payload = {
          name: form.name.trim(),
          type: form.type?.trim() || undefined,
          price,
          stock,
          image: form.image?.trim() || undefined,
          description: form.description?.trim() || undefined,
        };
      }

      const created = await createAgricareProduct(payload);
      setProducts((list) => [created, ...list]);
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      const msg = err?.message || 'Failed to add product';
      setFormError(msg);
    } finally {
      setAdding(false);
    }
  };

  const counts = useMemo(() => ({
    products: stats.products || products.length,
    orders: stats.orders || orders.length,
    farmers: stats.farmers || farmers.length,
    revenue: stats.revenue || orders.reduce((sum, o) => sum + (o.total || 0), 0),
  }), [stats, products, orders, farmers]);

  const formatCurrency = (amount, currency = "INR") => {
    try { return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount || 0); }
    catch { return `₹${amount || 0}`; }
  };

  const renderOverview = () => (
    <div className="agricare-dashboard">
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>Welcome back, {profile.fullName || user.username}!</h2>
          <p>Manage your agricultural products and services.</p>
        </div>
        <div className="welcome-image">
          <img src="/images/plant13.jpeg" alt="Welcome" />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#4CAF50" }}>🧪</div>
          <div className="stat-details">
            <h3>{loading ? "..." : counts.products}</h3>
            <p>Active Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#2196F3" }}>🛒</div>
          <div className="stat-details">
            <h3>{loading ? "..." : counts.orders}</h3>
            <p>Recent Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#FF9800" }}>👨‍🌾</div>
          <div className="stat-details">
            <h3>{loading ? "..." : counts.farmers}</h3>
            <p>Farmer Clients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#9C27B0" }}>💰</div>
          <div className="stat-details">
            <h3>{loading ? "..." : formatCurrency(counts.revenue)}</h3>
            <p>Monthly Revenue</p>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-col">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Orders</h3>
              <button className="view-all-btn" onClick={() => setActive("orders")}>View All</button>
            </div>
            <div className="card-content">
              {loading ? (
                <div className="empty-state">
                  <div className="empty-icon">⏳</div>
                  <h3>Loading orders...</h3>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🛒</div>
                  <h3>No recent orders</h3>
                  <p>Orders will appear here as they come in.</p>
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
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.date}</td>
                        <td><span className={`status-badge ${String(o.status).toLowerCase()}`}>{o.status}</span></td>
                        <td>{formatCurrency(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-col">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Top Products</h3>
              <button className="view-all-btn" onClick={() => setActive("products")}>View All</button>
            </div>
            <div className="card-content">
              {loading ? (
                <div className="empty-state">
                  <div className="empty-icon">⏳</div>
                  <h3>Loading products...</h3>
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🧪</div>
                  <h3>No products yet</h3>
                  <p>Add your first AgriCare product to get started.</p>
                </div>
              ) : (
                <div className="product-grid">
                  {products.slice(0, 4).map(p => (
                    <div className="product-card" key={p.id}>
                      <div className="product-image">
                        <img src="/images/plant12.jpeg" alt={p.name} />
                      </div>
                      <div className="product-details">
                        <h4>{p.name}</h4>
                        <p className="product-price">{formatCurrency(p.price)} • Stock {p.stock}</p>
                        <button className="view-all-btn" onClick={() => setActive("products")}>Manage</button>
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

  const [searchProducts, setSearchProducts] = useState("");
  const filteredProducts = useMemo(() => {
    const q = searchProducts.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [products, searchProducts]);

  const renderProducts = () => (
    <div className="agricare-dashboard">
      <div className="dashboard-card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>Products</h3>
          <button className="view-all-btn" onClick={() => setShowAddModal(true)}>+ Add New</button>
        </div>
        <div className="card-content">
          <div className="marketplace-controls controls-card" style={{ padding: 12, marginBottom: 16, borderRadius: 12, background: '#f8fafc' }}>
            <div className="search-bar">
              <input type="text" placeholder="Search products..." value={searchProducts} onChange={(e) => setSearchProducts(e.target.value)} />
              <button className="search-btn">🔍</button>
            </div>
          </div>
          {filteredProducts.length === 0 ? (
            <p>No products found</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p._id || p.id}>
                    <td>{p._id || p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.type || '-'}</td>
                    <td>{p.stock}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td>
                      <button className="view-all-btn" onClick={() => alert(`Edit ${p.name}`)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showAddModal && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="modal" style={{ width: 720, maxWidth: '95%', borderRadius: 16 }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🧪</span> Add AgriCare Product
              </h3>
              <button className="close-btn" onClick={() => { setShowAddModal(false); resetForm(); }}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16 }}>
              {formError && <div className="alert-error" style={{ marginBottom: 12 }}>⚠️ {formError}</div>}
              <form onSubmit={onAddProduct} className="edit-profile-form">
                <div className="form-group">
                  <label>Name</label>
                  <input name="name" value={form.name} onChange={onFormChange} required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={form.type} onChange={onFormChange}>
                    <option>Fertilizer</option>
                    <option>Tonic</option>
                    <option>Medicine</option>
                    <option>Seeds</option>
                    <option>Equipment</option>
                    <option>Service</option>
                    <option>Pesticide</option>
                    <option>Fungicide</option>
                    <option>Herbicide</option>
                    <option>Soil Test Kit</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input type="number" name="price" value={form.price} min="0.01" step="0.01" onChange={onFormChange} required />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" name="stock" value={form.stock} min="1" step="1" onChange={onFormChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Image (file)</label>
                  <input type="file" accept="image/*" onChange={onFileChange} />
                </div>
                <div className="form-group">
                  <label>Image URL (optional)</label>
                  <input name="image" value={form.image} onChange={onFormChange} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={onFormChange} />
                </div>
                <div className="form-actions">
                  <button className="save-btn" type="submit" disabled={adding}>{adding ? 'Adding...' : 'Add Product'}</button>
                  <button className="view-all-btn" type="button" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</button>
                </div>
              </form>
              <div className="preview-pane" style={{ paddingLeft: 8 }}>
                <div style={{ background: '#f1f5f9', borderRadius: 12, height: 260, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                  {preview || form.image ? (
                    <img src={preview || form.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ color: '#64748b' }}>Image preview</div>
                  )}
                </div>
                <p style={{ marginTop: 10, color: '#64748b', fontSize: 13 }}>Tip: Add a clear product image for better visibility.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const [statusFilter, setStatusFilter] = useState("All");
  const statusTabs = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];
  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return orders;
    return orders.filter(o => String(o.status) === statusFilter);
  }, [orders, statusFilter]);

  const renderOrders = () => (
    <div className="agricare-dashboard">
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Orders</h3>
          <div>
            {statusTabs.map(s => (
              <button
                key={s}
                className={`view-all-btn ${statusFilter === s ? 'active' : ''}`}
                style={{ marginLeft: 8 }}
                onClick={() => setStatusFilter(s)}
              >{s}</button>
            ))}
          </div>
        </div>
        <div className="card-content">
          {filteredOrders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.date}</td>
                    <td><span className={`status-badge ${String(o.status).toLowerCase()}`}>{o.status}</span></td>
                    <td>{o.items}</td>
                    <td>{formatCurrency(o.total)}</td>
                    <td>
                      <button className="view-all-btn" onClick={() => alert(`View ${o.id}`)}>View</button>
                      {o.status === 'Processing' && (
                        <button className="view-all-btn" style={{ marginLeft: 8 }} onClick={() => alert(`Mark shipped ${o.id}`)}>Mark Shipped</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );

  const renderFarmers = () => (
    <div className="agricare-dashboard">
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Farmer Clients</h3>
          <button className="view-all-btn" onClick={() => alert("Invite Farmer")}>Invite</button>
        </div>
        <div className="card-content">
          {farmers.length === 0 ? (
            <p>No farmers yet</p>
          ) : (
            <div className="product-grid">
              {farmers.map(f => (
                <div className="product-card" key={f.id}>
                  <div className="product-image">
                    <img src="/images/plant11.jpeg" alt={f.name} />
                  </div>
                  <div className="product-details">
                    <h4>{f.name}</h4>
                    <p className="product-price">📍 {f.location}</p>
                    <button className="view-all-btn" onClick={() => alert(`Message ${f.name}`)}>Message</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="agricare-dashboard">
      <div className="dashboard-card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>Sales Overview</h3></div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[{ label: 'This Week', value: 65 }, { label: 'This Month', value: 78 }].map((m, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>{m.label}</span><span>{m.value}%</span>
                </div>
                <div style={{ height: 10, background: '#eee', borderRadius: 999 }}>
                  <div style={{ width: `${m.value}%`, height: '100%', background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header"><h3>Top Performing Products</h3></div>
        <div className="card-content">
          {products.length === 0 ? (
            <p>No data</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{(idx + 1) * 7}</td>
                    <td>{formatCurrency((idx + 1) * 1500)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [msg, setMsg] = useState("");
  const onSaveProfile = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsSavingProfile(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      setMsg("Profile updated");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const renderProfile = () => (
    <div className="agricare-dashboard">
      <div className="dashboard-card">
        <div className="card-header"><h3>Profile</h3></div>
        <div className="card-content">
          {msg && <div className="alert-success" style={{ marginBottom: 12 }}>✅ {msg}</div>}
          <form onSubmit={onSaveProfile} className="edit-profile-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" value={profile.fullName} onChange={(e) => setProfile(p => ({ ...p, fullName: e.target.value }))} placeholder="Enter your full name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" type="tel" value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
            </div>
            <div className="form-actions">
              <button className="save-btn" type="submit" disabled={isSavingProfile}>{isSavingProfile ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const body = (() => {
    switch (active) {
      case "products": return renderProducts();
      case "orders": return renderOrders();
      case "farmers": return renderFarmers();
      case "analytics": return renderAnalytics();
      case "feedback": return <FeedbackForm title="AgriCare Feedback" />;
      case "profile": return renderProfile();
      case "overview":
      default: return renderOverview();
    }
  })();

  return (
    <DashboardLayout
      user={user}
      menuItems={menuItems}
      pageTitle="AgriCare Dashboard"
      roleName="AgriCare Provider"
      onMenuItemClick={(id) => setActive(id)}
    >
      {body}
    </DashboardLayout>
  );
}