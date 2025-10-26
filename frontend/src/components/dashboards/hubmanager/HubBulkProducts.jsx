import React, { useState, useEffect } from "react";
import api from '../../../services/api';
import "../../../css/HubDashboard.css";
import { useToast } from "../../notifications/ToastContainer";

export default function HubBulkProducts({ user }) {
  const [bulkProducts, setBulkProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingAction, setProcessingAction] = useState(null);
  
  const { showSuccess, showError } = useToast();

  // Fetch bulk products from API
  useEffect(() => {
    fetchBulkProducts();
  }, []);

  const fetchBulkProducts = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching bulk products for hub manager:', user?.username);
      
      // Get hub name from user's profile data
      const hubName = user?.profileData?.assignedHub;
      
      const params = {
        limit: 100
      };
      
      if (hubName) {
        params.hubName = hubName;
        console.log('🏢 Filtering by hub:', hubName);
      }
      
      const response = await api.get('/hubmanager/bulk-products', { params });
      console.log('📦 Bulk products response:', response.data);
      
      if (response.data && response.data.items) {
        setBulkProducts(response.data.items);
        console.log(`✅ Found ${response.data.items.length} bulk products`);
      } else {
        setBulkProducts([]);
      }
    } catch (error) {
      console.error("❌ Error fetching bulk products:", error);
      showError(
        'Failed to Load',
        'Could not fetch bulk products. Please try again.',
        { duration: 3000 }
      );
      setBulkProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchBulkProducts();
      showSuccess(
        'Refreshed Successfully! 🔄',
        `Updated bulk products list`,
        { duration: 2000 }
      );
    } catch (error) {
      console.error("Error refreshing:", error);
      showError('Refresh Failed', 'Please try again.', { duration: 3000 });
    } finally {
      setRefreshing(false);
    }
  };

  // Filter products based on search and grade filter
  const filteredProducts = bulkProducts.filter(product => {
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" || product.grade === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Handle accept product
  const handleAcceptProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to accept this bulk product?')) {
      return;
    }

    setProcessingAction(productId);
    try {
      await api.post(`/hubmanager/bulk-products/${productId}/accept`);
      
      // Update local state
      setBulkProducts(prev => prev.map(p => 
        p._id === productId 
          ? { ...p, bulkProductStatus: 'accepted', hubReviewedAt: new Date() }
          : p
      ));
      
      showSuccess(
        'Product Accepted! ✅',
        'The farmer has been notified via email.',
        { duration: 4000 }
      );
      
      // Refresh the list
      await fetchBulkProducts();
    } catch (error) {
      console.error('Error accepting product:', error);
      showError(
        'Action Failed',
        error.response?.data?.message || 'Failed to accept product',
        { duration: 4000 }
      );
    } finally {
      setProcessingAction(null);
    }
  };

  // Handle reject product
  const handleRejectProduct = async (productId) => {
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      showError('Reason Required', 'Please provide a reason for rejection');
      return;
    }

    setProcessingAction(productId);
    try {
      await api.post(`/hubmanager/bulk-products/${productId}/reject`, {
        reason: rejectionReason
      });
      
      // Update local state
      setBulkProducts(prev => prev.map(p => 
        p._id === productId 
          ? { ...p, bulkProductStatus: 'rejected', hubReviewedAt: new Date(), rejectionReason }
          : p
      ));
      
      showWarning(
        'Product Rejected',
        'The farmer has been notified via email.',
        { duration: 4000 }
      );
      
      // Close modal and reset
      setShowRejectModal(null);
      setRejectionReason('');
      
      // Refresh the list
      await fetchBulkProducts();
    } catch (error) {
      console.error('Error rejecting product:', error);
      showError(
        'Action Failed',
        error.response?.data?.message || 'Failed to reject product',
        { duration: 4000 }
      );
    } finally {
      setProcessingAction(null);
    }
  };

  const getGradeBadge = (grade) => {
    const badges = {
      Premium: { bg: "#fef3c7", color: "#92400e", icon: "⭐" },
      Organic: { bg: "#d1fae5", color: "#065f46", icon: "🌿" },
      Regular: { bg: "#e0e7ff", color: "#3730a3", icon: "📦" }
    };
    return badges[grade] || badges.Regular;
  };

  return (
    <div className="hub-bulk-products">
      {/* Header */}
      <div className="page-header" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
        <div>
          <h2>Bulk Products</h2>
          <p>View bulk product offerings from farmers assigned to your hub</p>
          {user?.profileData?.assignedHub && (
            <p style={{ fontSize: '14px', marginTop: '4px' }}>
              🏢 {user.profileData.assignedHub}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={handleManualRefresh}
            disabled={refreshing}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {refreshing ? '🔄' : '↻'} {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="header-badge">{filteredProducts.length} Products</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Search by name, district, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1',
            minWidth: '300px',
            padding: '10px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        
        <div className="filter-tabs" style={{ margin: 0 }}>
          <button 
            className={filter === "all" ? "active" : ""} 
            onClick={() => setFilter("all")}
          >
            All ({bulkProducts.length})
          </button>
          <button 
            className={filter === "Premium" ? "active" : ""} 
            onClick={() => setFilter("Premium")}
          >
            ⭐ Premium ({bulkProducts.filter(p => p.grade === "Premium").length})
          </button>
          <button 
            className={filter === "Organic" ? "active" : ""} 
            onClick={() => setFilter("Organic")}
          >
            🌿 Organic ({bulkProducts.filter(p => p.grade === "Organic").length})
          </button>
          <button 
            className={filter === "Regular" ? "active" : ""} 
            onClick={() => setFilter("Regular")}
          >
            📦 Regular ({bulkProducts.filter(p => p.grade === "Regular").length})
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bulk-products-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading bulk products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No bulk products found</h3>
            <p>
              {searchTerm 
                ? "Try adjusting your search criteria" 
                : "No farmers have added bulk products to your hub yet"}
            </p>
            {!user?.profileData?.assignedHub && (
              <p style={{ color: '#f59e0b', marginTop: '8px' }}>
                ⚠️ No hub assigned to your account. Contact admin to assign a hub.
              </p>
            )}
          </div>
        ) : (
          <div className="bulk-products-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredProducts.map(product => {
              const gradeBadge = getGradeBadge(product.grade);
              
              return (
                <div 
                  key={product._id} 
                  className="bulk-product-card"
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedProduct(product)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Product Image */}
                  {product.image && (
                    <div style={{
                      width: '100%',
                      height: '180px',
                      overflow: 'hidden',
                      background: '#f3f4f6'
                    }}>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Product Details */}
                  <div style={{ padding: '16px' }}>
                    {/* Status Badge */}
                    {product.bulkProductStatus && (
                      <div style={{ marginBottom: '12px' }}>
                        {product.bulkProductStatus === 'pending' && (
                          <span style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}>
                            ⌛ Pending Review
                          </span>
                        )}
                        {product.bulkProductStatus === 'accepted' && (
                          <span style={{
                            background: '#d1fae5',
                            color: '#065f46',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}>
                            ✅ Accepted
                          </span>
                        )}
                        {product.bulkProductStatus === 'rejected' && (
                          <span style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}>
                            ❌ Rejected
                          </span>
                        )}
                      </div>
                    )}

                    {/* Header */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <h3 style={{ 
                          margin: '0 0 4px 0',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}>
                          {product.name}
                        </h3>
                        <span 
                          style={{ 
                            background: gradeBadge.bg, 
                            color: gradeBadge.color,
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {gradeBadge.icon} {product.grade}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '20px', 
                          fontWeight: '700',
                          color: '#059669'
                        }}>
                          ₹{product.price}/kg
                        </div>
                      </div>
                    </div>

                    {/* Stock Info */}
                    <div style={{
                      background: '#f9fafb',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          Available Stock
                        </span>
                        <span style={{ 
                          fontSize: '16px', 
                          fontWeight: '600',
                          color: '#059669'
                        }}>
                          {product.stock} kg
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid #e5e7eb'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          Total Value
                        </span>
                        <span style={{ 
                          fontSize: '16px', 
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          ₹{(product.price * product.stock).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      📍 {product.district}, {product.state}
                    </div>

                    {/* Farmer Info */}
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      👨‍🌾 {product.user?.username}
                      {product.user?.phone && (
                        <span style={{ marginLeft: '8px' }}>
                          📞 {product.user.phone}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {product.description && (
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#4b5563',
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid #e5e7eb',
                        lineHeight: '1.5'
                      }}>
                        {product.description.length > 100 
                          ? `${product.description.substring(0, 100)}...` 
                          : product.description}
                      </div>
                    )}

                    {/* Action Buttons for Pending Products */}
                    {product.bulkProductStatus === 'pending' && (
                      <div 
                        style={{ 
                          marginTop: '16px',
                          paddingTop: '16px',
                          borderTop: '2px solid #e5e7eb',
                          display: 'flex',
                          gap: '8px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleAcceptProduct(product._id)}
                          disabled={processingAction === product._id}
                          style={{
                            flex: 1,
                            padding: '10px',
                            background: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: processingAction === product._id ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            opacity: processingAction === product._id ? 0.6 : 1
                          }}
                        >
                          {processingAction === product._id ? '⏳ Processing...' : '✅ Accept'}
                        </button>
                        <button
                          onClick={() => setShowRejectModal(product._id)}
                          disabled={processingAction === product._id}
                          style={{
                            flex: 1,
                            padding: '10px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: processingAction === product._id ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            opacity: processingAction === product._id ? 0.6 : 1
                          }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}

                    {/* Date */}
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#9ca3af',
                      marginTop: '12px'
                    }}>
                      Added {new Date(product.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0 }}>{selectedProduct.name}</h2>
              <button 
                onClick={() => setSelectedProduct(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {selectedProduct.image && (
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}
              />
            )}

            <div style={{ marginBottom: '20px' }}>
              <h3>Product Details</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 0', fontWeight: '500' }}>Grade</td>
                    <td>{selectedProduct.grade}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 0', fontWeight: '500' }}>Price per kg</td>
                    <td>₹{selectedProduct.price}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 0', fontWeight: '500' }}>Available Stock</td>
                    <td>{selectedProduct.stock} kg</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 0', fontWeight: '500' }}>Total Value</td>
                    <td>₹{(selectedProduct.price * selectedProduct.stock).toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 0', fontWeight: '500' }}>Location</td>
                    <td>{selectedProduct.district}, {selectedProduct.state}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 0', fontWeight: '500' }}>Hub</td>
                    <td>{selectedProduct.nearestHub}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>Farmer Information</h3>
              <p><strong>Name:</strong> {selectedProduct.user?.username}</p>
              <p><strong>Email:</strong> {selectedProduct.user?.email}</p>
              {selectedProduct.user?.phone && (
                <p><strong>Phone:</strong> {selectedProduct.user.phone}</p>
              )}
            </div>

            {selectedProduct.description && (
              <div style={{ marginBottom: '20px' }}>
                <h3>Description</h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                  {selectedProduct.description}
                </p>
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              gap: '12px',
              marginTop: '24px'
            }}>
              <button 
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onClick={() => {
                  if (selectedProduct.user?.phone) {
                    window.open(`tel:${selectedProduct.user.phone}`);
                  } else {
                    showError('No Phone', 'Farmer phone number not available');
                  }
                }}
              >
                📞 Call Farmer
              </button>
              <button 
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onClick={() => {
                  if (selectedProduct.user?.email) {
                    window.open(`mailto:${selectedProduct.user.email}`);
                  } else {
                    showError('No Email', 'Farmer email not available');
                  }
                }}
              >
                ✉️ Email Farmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '20px'
          }}
          onClick={() => {
            setShowRejectModal(null);
            setRejectionReason('');
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>❌ Reject Bulk Product</h2>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                Please provide a reason for rejecting this product. The farmer will be notified via email.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Quality does not meet standards, Incorrect pricing, Quantity too high..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                maxLength={500}
              />
              <div style={{ 
                fontSize: '12px', 
                color: '#9ca3af',
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {rejectionReason.length}/500 characters
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectProduct(showRejectModal)}
                disabled={!rejectionReason || rejectionReason.trim().length === 0 || processingAction === showRejectModal}
                style={{
                  padding: '10px 20px',
                  background: rejectionReason && rejectionReason.trim().length > 0 ? '#dc2626' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: rejectionReason && rejectionReason.trim().length > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
              >
                {processingAction === showRejectModal ? '⏳ Rejecting...' : '❌ Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
