import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/CheckoutPage.css';

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    try {
      const cart = localStorage.getItem('customerCart');
      if (cart) {
        const items = JSON.parse(cart);
        setCartItems(Array.isArray(items) ? items : []);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    const updatedItems = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('customerCart', JSON.stringify(updatedItems));
  };

  const removeItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('customerCart', JSON.stringify(updatedItems));
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const proceedToCheckout = (productId) => {
    navigate(`/checkout/${productId}`);
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="loading">Loading your cart...</div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        <h2 className="checkout-title">Shopping Cart</h2>
      </div>

      {cartItems.length === 0 ? (
        <div className="checkout-card">
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some products to your cart to see them here.</p>
            <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="checkout-grid">
          <div className="checkout-card">
            <h3 className="section-title">Cart Items ({cartItems.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map((item) => (
                <div key={item.id} className="product-line" style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  <div className="thumb">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div className="p-meta" style={{ flex: 1 }}>
                    <div className="p-name">{item.name}</div>
                    <div className="p-sub">Grade: {item.grade || '-'}</div>
                    <div className="p-price">₹{item.price}/kg</div>
                    
                    <div className="qty-row" style={{ marginTop: '12px' }}>
                      <span>Quantity:</span>
                      <div className="qty-control">
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          min={1} 
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(item.id, Math.max(1, Number(e.target.value) || 1))}
                        />
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => proceedToCheckout(item.id)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="checkout-card summary-card">
            <h3 className="section-title">Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            
            <div className="hr" />
            <div className="totals">
              <span>Total</span>
              <span>₹{getTotalAmount().toLocaleString('en-IN')}</span>
            </div>
            <div className="p-sub" style={{ marginTop: 6 }}>
              Inclusive of all taxes
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                Note: You can buy items individually by clicking "Buy Now" on each item.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
