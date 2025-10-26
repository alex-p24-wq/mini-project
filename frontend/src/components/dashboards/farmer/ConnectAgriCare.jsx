import React, { useEffect, useState } from "react";
import "../../../css/FarmerDashboard.css";
import { getAgricareCatalog } from "../../../services/api";

// Show AgriCare product catalog for farmers
export default function ConnectAgriCare() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getAgricareCatalog({ page: 1, limit: 24 });
        setItems(res.items || []);
      } catch (e) {
        setError(e?.message || "Failed to load AgriCare catalog");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = items.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>AgriCare Catalog</h3>
        <div className="search-bar" style={{ marginLeft: 'auto' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="card-content">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="alert-error">{error}</div>
        ) : filtered.length === 0 ? (
          <p>No products found</p>
        ) : (
          <div className="products-grid">
            {filtered.map((p) => (
              <div className="product-card" key={p._id || p.id}>
                <div className="product-image" style={{ height: 160, background: '#f5f7f9', display: 'grid', placeItems: 'center' }}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="empty-img">🧪</div>
                  )}
                </div>
                <div className="product-details">
                  <h3>{p.name}</h3>
                  <p className="product-price">₹{p.price} • Stock {p.stock}{p.type ? ` • ${p.type}` : ''}</p>
                  {p.description && <p style={{ marginTop: 6, color: '#455a64', fontSize: 13 }}>{p.description}</p>}
                  <div className="product-actions" style={{ marginTop: 8 }}>
                    <button className="view-all-btn" onClick={() => alert(`Request info about ${p.name}`)}>Request Info</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}