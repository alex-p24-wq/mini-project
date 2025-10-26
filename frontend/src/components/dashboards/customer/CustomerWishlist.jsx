import React, { useEffect, useMemo, useState } from "react";
import "../../../css/CustomerDashboard.css";
import { getWishlist, removeFromWishlist, addToWishlist, createCustomerOrder } from "../../../services/api";

export default function CustomerWishlist({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getWishlist();
      setItems(res.items || []);
    } catch (e) {
      setError(e?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let arr = [...items];
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(i => (i.name || "").toLowerCase().includes(q) || (i.address || "").toLowerCase().includes(q));
    }
    switch (sortBy) {
      case "price-asc":
        arr.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        arr.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "recent":
      default:
        arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return arr;
  }, [items, search, sortBy]);

  const onRemove = async (id) => {
    try {
      const res = await removeFromWishlist(id);
      setItems(res.items || []);
    } catch (e) {
      alert(e?.message || 'Failed to remove');
    }
  };

  const buyNow = async (id) => {
    try {
      await createCustomerOrder({ productId: id, quantity: 1 });
      alert('Order placed! Check My Orders.');
    } catch (e) {
      alert(e?.message || 'Failed to create order');
    }
  };

  return (
    <div className="customer-wishlist">
      <div className="wishlist-hero">
        <div>
          <div className="hero-badge">❤️ Wishlist</div>
          <h2>Saved items</h2>
          <p>Quickly purchase or manage your saved products</p>
        </div>
        <div className="wishlist-controls">
          <input
            type="text"
            placeholder="Search saved items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Recently Added</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="wishlist-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="wishlist-card skeleton" key={i}>
              <div className="skeleton-image" />
              <div className="skeleton-text" style={{ width: '70%' }} />
              <div className="skeleton-text" style={{ width: '40%' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you like by clicking the heart icon in Marketplace</p>
          <button className="browse-btn">Browse Products</button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {filtered.map((item) => (
            <div className="wishlist-card fancy" key={item._id || item.id}>
              <div className="wishlist-thumb">
                {item.image ? <img src={item.image} alt={item.name} /> : <div className="empty-img">📦</div>}
                {item.grade && <div className={`grade-pill ${String(item.grade).toLowerCase()}`}>{item.grade}</div>}
              </div>
              <div className="wishlist-body">
                <h3>{item.name}</h3>
                {item.address && <p className="muted">📍 {item.address}</p>}
                <div className="wishlist-meta">
                  <span className="price">₹{item.price}/kg</span>
                  {typeof item.stock === 'number' && (
                    <span className={`stock ${item.stock > 0 ? 'in' : 'out'}`}>{item.stock > 0 ? 'In stock' : 'Out of stock'}</span>
                  )}
                </div>
                <div className="wishlist-actions">
                  <button className="btn-primary" disabled={item.stock <= 0} onClick={() => buyNow(item._id || item.id)}>
                    {item.stock > 0 ? 'Buy Now' : 'Notify Me'}
                  </button>
                  <button className="btn-ghost" onClick={() => onRemove(item._id || item.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}